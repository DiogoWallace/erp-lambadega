<?php

namespace App\Services;

use App\DataTransferObjects\CreateOrderDTO;
use App\DataTransferObjects\OrderItemDTO;
use App\DataTransferObjects\PayOrderDTO;
use App\Models\FinancialTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(private InventoryService $inventory) {}

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

    public function create(CreateOrderDTO $dto): Order
    {
        return DB::transaction(function () use ($dto) {
            $user       = auth()->user();
            $productIds = array_map(static fn (OrderItemDTO $item) => $item->productId, $dto->items);

            $products = Product::lockForUpdate()
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            // Validate stock
            foreach ($dto->items as $item) {
                $product = $products[$item->productId] ?? null;
                if (!$product) {
                    throw ValidationException::withMessages([
                        'items' => ["Produto {$item->productId} não encontrado."],
                    ]);
                }
                if ($product->stock_quantity < $item->quantity) {
                    throw ValidationException::withMessages([
                        'items' => ["Estoque insuficiente para \"{$product->name}\". Disponível: {$product->stock_quantity}."],
                    ]);
                }
            }

            // Compute subtotal (items without order-level discount)
            $subtotal = 0;
            foreach ($dto->items as $item) {
                $product   = $products[$item->productId];
                $unitPrice = $item->unitPrice ?? (float) $product->sale_price;
                $subtotal += ($unitPrice * $item->quantity) - $item->discountAmount;
            }

            $discountAmount = $dto->discountType === 'percentage'
                ? round($subtotal * $dto->discountAmount / 100, 2)
                : min($dto->discountAmount, $subtotal);
            $total = max(0.0, $subtotal - $discountAmount);

            $order = Order::create([
                'order_number'    => $this->generateOrderNumber($user->establishment_id),
                'customer_id'     => $dto->customerId,
                'user_id'         => $user->id,
                'subtotal_amount' => $subtotal,
                'discount_amount' => $discountAmount,
                'discount_type'   => $dto->discountType,
                'total_amount'    => $total,
                'status'          => 'pending',
                'notes'           => $dto->notes,
            ]);

            foreach ($dto->items as $item) {
                $product   = $products[$item->productId];
                $qty       = $item->quantity;
                $unitPrice = $item->unitPrice ?? (float) $product->sale_price;
                $costPrice = (float) $product->cost_price;
                $itemTotal = ($unitPrice * $qty) - $item->discountAmount;

                OrderItem::create([
                    'order_id'        => $order->id,
                    'product_id'      => $product->id,
                    'quantity'        => $qty,
                    'unit_price'      => $unitPrice,
                    'cost_price'      => $costPrice,
                    'discount_amount' => $item->discountAmount,
                    'total_price'     => $itemTotal,
                    'notes'           => $item->notes,
                ]);

                $this->inventory->decreaseForOrder($order, $product, $qty, $user);
            }

            if (!empty($dto->paymentMethod)) {
                $this->pay($order, new PayOrderDTO($dto->paymentMethod, $dto->installments));
            }

            return $order->load(['items.product:id,name,sku', 'customer:id,name', 'user:id,name']);
        });
    }

    public function pay(Order $order, PayOrderDTO $dto): Order
    {
        if ($order->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => ['Este pedido não pode ser pago.'],
            ]);
        }

        return DB::transaction(function () use ($order, $dto) {
            $paymentMethod = $dto->paymentMethod;
            $installments  = $dto->installments;

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
            $user = auth()->user();
            $order->update(['status' => 'canceled']);

            foreach ($order->items as $item) {
                $product = Product::lockForUpdate()->find($item->product_id);
                $this->inventory->restoreForOrder($order, $product, $item->quantity, $user);
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
