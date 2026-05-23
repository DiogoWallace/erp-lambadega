<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Dono único das escritas de estoque: toda mutação de Product.stock_quantity
 * e toda criação de StockMovement passa por aqui. Nenhum outro service deve
 * instanciar StockMovement nem alterar stock_quantity diretamente.
 */
class InventoryService
{
    public function __construct(private NotificationService $notifications) {}

    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = StockMovement::query()
            ->with(['product:id,name', 'user:id,name'])
            ->orderByDesc('created_at');

        if (!empty($filters['product_id'])) {
            $query->where('product_id', $filters['product_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->paginate(20);
    }

    /**
     * Movimentação manual (in/out/adjustment) disparada pela tela de estoque.
     */
    public function record(Product $product, array $data, User $user): StockMovement
    {
        return DB::transaction(function () use ($product, $data, $user) {
            $locked = Product::lockForUpdate()->find($product->id);

            $stockBefore = $locked->stock_quantity;
            $type        = $data['type'];
            $quantity    = (int) $data['quantity'];

            $stockAfter = match ($type) {
                'in'         => $stockBefore + $quantity,
                'out'        => $stockBefore - $quantity,
                'adjustment' => $quantity,
            };

            if ($stockAfter < 0) {
                throw new \DomainException(
                    "Estoque insuficiente. Estoque atual: {$stockBefore}."
                );
            }

            $movement = StockMovement::create([
                'product_id'   => $locked->id,
                'user_id'      => $user->id,
                'type'         => $type,
                'quantity'     => $quantity,
                'stock_before' => $stockBefore,
                'stock_after'  => $stockAfter,
                'cost_price'   => $data['cost_price'] ?? null,
                'description'  => $data['description'] ?? null,
            ]);

            $locked->update(['stock_quantity' => $stockAfter]);

            $this->maybeNotifyStockLevel($locked->fresh());

            return $movement->load(['product:id,name', 'user:id,name']);
        });
    }

    /**
     * Baixa de estoque referente a uma venda. O produto deve já estar travado
     * (lockForUpdate) pela transação do chamador.
     */
    public function decreaseForOrder(Order $order, Product $product, int $quantity, User $user): StockMovement
    {
        $stockBefore = $product->stock_quantity;
        $product->decrement('stock_quantity', $quantity);

        $movement = StockMovement::create([
            'product_id'     => $product->id,
            'user_id'        => $user->id,
            'reference_type' => Order::class,
            'reference_id'   => $order->id,
            'type'           => 'out',
            'quantity'       => $quantity,
            'stock_before'   => $stockBefore,
            'stock_after'    => $stockBefore - $quantity,
            'description'    => "Venda {$order->order_number}",
        ]);

        $this->maybeNotifyStockLevel($product->fresh());

        return $movement;
    }

    /**
     * Devolução de estoque por cancelamento de venda. O produto deve já estar
     * travado (lockForUpdate) pela transação do chamador.
     */
    public function restoreForOrder(Order $order, Product $product, int $quantity, User $user): StockMovement
    {
        $stockBefore = $product->stock_quantity;
        $product->increment('stock_quantity', $quantity);

        return StockMovement::create([
            'product_id'     => $product->id,
            'user_id'        => $user->id,
            'reference_type' => Order::class,
            'reference_id'   => $order->id,
            'type'           => 'in',
            'quantity'       => $quantity,
            'stock_before'   => $stockBefore,
            'stock_after'    => $stockBefore + $quantity,
            'description'    => "Cancelamento {$order->order_number}",
        ]);
    }

    /**
     * Emite broadcast quando o estoque do produto atinge zero ou cai abaixo
     * do mínimo. Dedup é feito pelo NotificationService (mesmo produto+tipo
     * em 24h não dispara de novo). Apenas para produtos ativos.
     */
    private function maybeNotifyStockLevel(Product $product): void
    {
        if (!$product->is_active) {
            return;
        }

        $stock = (int) $product->stock_quantity;
        $min   = (int) $product->min_stock_quantity;

        if ($stock <= 0) {
            $this->notifications->createBroadcast(
                establishmentId: $product->establishment_id,
                type:            'stock.out',
                title:           "Estoque zerado: {$product->name}",
                severity:        'critical',
                body:            "O produto \"{$product->name}\" está sem estoque.",
                actionUrl:       "/products/{$product->id}/edit",
                data:            ['product_id' => $product->id],
            );
            return;
        }

        if ($min > 0 && $stock <= $min) {
            $this->notifications->createBroadcast(
                establishmentId: $product->establishment_id,
                type:            'stock.critical',
                title:           "Estoque crítico: {$product->name}",
                severity:        'warning',
                body:            "Restam {$stock} unidades (mínimo: {$min}).",
                actionUrl:       "/products/{$product->id}/edit",
                data:            ['product_id' => $product->id],
            );
        }
    }
}
