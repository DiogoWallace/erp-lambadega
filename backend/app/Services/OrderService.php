<?php

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return Order::with(['customer:id,name', 'user:id,name'])
            ->withCount('items')
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['customer_id'] ?? null, fn ($q, $v) => $q->where('customer_id', $v))
            ->when($filters['date_from'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['date_to'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('order_number', 'like', "%{$v}%"))
            ->latest()
            ->paginate(25);
    }

    public function find(string $id): Order
    {
        return Order::with(['items.product:id,name,sku', 'customer:id,name', 'user:id,name'])
            ->findOrFail($id);
    }

    public function create(array $data): Order
    {
        return DB::transaction(function () use ($data) {
            $user        = auth()->user();
            $itemsData   = $data['items'];
            $productIds  = array_column($itemsData, 'product_id');

            $products = Product::lockForUpdate()
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            // Validate stock
            foreach ($itemsData as $item) {
                $product = $products[$item['product_id']] ?? null;
                if (!$product) {
                    throw ValidationException::withMessages([
                        'items' => ["Produto {$item['product_id']} não encontrado."],
                    ]);
                }
                if ($product->stock_quantity < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => ["Estoque insuficiente para \"{$product->name}\". Disponível: {$product->stock_quantity}."],
                    ]);
                }
            }

            // Compute subtotal (items without order-level discount)
            $subtotal = 0;
            foreach ($itemsData as $item) {
                $product      = $products[$item['product_id']];
                $unitPrice    = isset($item['unit_price']) && $item['unit_price'] !== null
                    ? (float) $item['unit_price']
                    : (float) $product->sale_price;
                $itemDiscount = (float) ($item['discount_amount'] ?? 0);
                $subtotal    += ($unitPrice * $item['quantity']) - $itemDiscount;
            }

            $discountType  = $data['discount_type'] ?? 'fixed';
            $discountValue = (float) ($data['discount_amount'] ?? 0);
            $discountAmount = $discountType === 'percentage'
                ? round($subtotal * $discountValue / 100, 2)
                : min($discountValue, $subtotal);
            $total = max(0.0, $subtotal - $discountAmount);

            $order = Order::create([
                'order_number'    => $this->generateOrderNumber($user->establishment_id),
                'customer_id'     => $data['customer_id'] ?? null,
                'user_id'         => $user->id,
                'subtotal_amount' => $subtotal,
                'discount_amount' => $discountAmount,
                'discount_type'   => $discountType,
                'total_amount'    => $total,
                'status'          => 'pending',
                'notes'           => $data['notes'] ?? null,
            ]);

            foreach ($itemsData as $item) {
                $product      = $products[$item['product_id']];
                $qty          = $item['quantity'];
                $unitPrice    = isset($item['unit_price']) && $item['unit_price'] !== null
                    ? (float) $item['unit_price']
                    : (float) $product->sale_price;
                $costPrice    = (float) $product->cost_price;
                $itemDiscount = (float) ($item['discount_amount'] ?? 0);
                $itemTotal    = ($unitPrice * $qty) - $itemDiscount;

                OrderItem::create([
                    'order_id'        => $order->id,
                    'product_id'      => $product->id,
                    'quantity'        => $qty,
                    'unit_price'      => $unitPrice,
                    'cost_price'      => $costPrice,
                    'discount_amount' => $itemDiscount,
                    'total_price'     => $itemTotal,
                    'notes'           => $item['notes'] ?? null,
                ]);

                $stockBefore = $product->stock_quantity;
                $product->decrement('stock_quantity', $qty);

                StockMovement::create([
                    'product_id'     => $product->id,
                    'user_id'        => $user->id,
                    'reference_type' => Order::class,
                    'reference_id'   => $order->id,
                    'type'           => 'out',
                    'quantity'       => $qty,
                    'stock_before'   => $stockBefore,
                    'stock_after'    => $stockBefore - $qty,
                    'description'    => "Venda {$order->order_number}",
                ]);
            }

            if (!empty($data['payment_method'])) {
                $this->pay($order, $data['payment_method'], (int) ($data['installments'] ?? 1));
            }

            return $order->load(['items.product:id,name,sku', 'customer:id,name', 'user:id,name']);
        });
    }

    public function pay(Order $order, string $paymentMethod, int $installments = 1): Order
    {
        if ($order->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Este pedido não pode ser pago.'],
            ]);
        }

        return DB::transaction(function () use ($order, $paymentMethod, $installments) {
            $order->update([
                'status'         => 'paid',
                'payment_method' => $paymentMethod,
                'paid_at'        => now(),
            ]);

            $perInstallment = round((float) $order->total_amount / $installments, 2);

            for ($i = 1; $i <= $installments; $i++) {
                $isLast  = $i === $installments;
                $amount  = $isLast
                    ? round((float) $order->total_amount - ($perInstallment * ($installments - 1)), 2)
                    : $perInstallment;

                FinancialTransaction::create([
                    'order_id'           => $order->id,
                    'user_id'            => $order->user_id,
                    'customer_id'        => $order->customer_id,
                    'type'               => 'income',
                    'category'           => 'sales',
                    'description'        => "Venda {$order->order_number}"
                        . ($installments > 1 ? " ({$i}/{$installments})" : ''),
                    'amount'             => $amount,
                    'payment_method'     => $paymentMethod,
                    'due_date'           => now()->addMonths($i - 1)->toDateString(),
                    'payment_date'       => $installments === 1 ? now()->toDateString() : null,
                    'status'             => $installments === 1 ? 'paid' : 'pending',
                    'installment_number' => $installments > 1 ? $i : null,
                    'installment_count'  => $installments > 1 ? $installments : null,
                ]);
            }

            return $order->refresh();
        });
    }

    public function cancel(Order $order): Order
    {
        if ($order->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Apenas pedidos pendentes podem ser cancelados.'],
            ]);
        }

        return DB::transaction(function () use ($order) {
            $order->update(['status' => 'canceled']);

            foreach ($order->items as $item) {
                $product     = Product::lockForUpdate()->find($item->product_id);
                $stockBefore = $product->stock_quantity;
                $product->increment('stock_quantity', $item->quantity);

                StockMovement::create([
                    'product_id'     => $item->product_id,
                    'user_id'        => auth()->id(),
                    'reference_type' => Order::class,
                    'reference_id'   => $order->id,
                    'type'           => 'in',
                    'quantity'       => $item->quantity,
                    'stock_before'   => $stockBefore,
                    'stock_after'    => $stockBefore + $item->quantity,
                    'description'    => "Cancelamento {$order->order_number}",
                ]);
            }

            FinancialTransaction::where('order_id', $order->id)
                ->where('status', 'pending')
                ->update(['status' => 'canceled']);

            return $order->refresh();
        });
    }

    private function generateOrderNumber(string $establishmentId): string
    {
        $max = Order::withTrashed()
            ->where('establishment_id', $establishmentId)
            ->lockForUpdate()
            ->max(DB::raw("CAST(SUBSTRING(order_number, 5) AS UNSIGNED)"));

        return 'ORD-' . str_pad(($max ?? 0) + 1, 6, '0', STR_PAD_LEFT);
    }
}
