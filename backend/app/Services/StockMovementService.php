<?php

namespace App\Services;

use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class StockMovementService
{
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

            return $movement->load(['product:id,name', 'user:id,name']);
        });
    }
}
