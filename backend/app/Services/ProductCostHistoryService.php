<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductCostHistory;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

/**
 * Dono único das escritas em product_cost_history. Outros services
 * (InventoryService, ProductService) e o controller de cotação manual
 * chamam aqui — ninguém instancia ProductCostHistory diretamente.
 */
class ProductCostHistoryService
{
    public function recordFromStockIn(StockMovement $movement, Product $product, User $user): ?ProductCostHistory
    {
        if ($movement->type !== 'in' || $movement->cost_price === null || (float) $movement->cost_price <= 0) {
            return null;
        }

        return ProductCostHistory::create([
            'establishment_id'   => $product->establishment_id,
            'product_id'         => $product->id,
            'supplier_id'        => $product->supplier_id,
            'user_id'            => $user->id,
            'stock_movement_id'  => $movement->id,
            'cost_price'         => $movement->cost_price,
            'source'             => 'stock_in',
            'effective_at'       => $movement->created_at,
        ]);
    }

    public function recordFromProductUpdate(Product $product, ?User $user): ?ProductCostHistory
    {
        if ((float) $product->cost_price <= 0) {
            return null;
        }

        return ProductCostHistory::create([
            'establishment_id' => $product->establishment_id,
            'product_id'       => $product->id,
            'supplier_id'      => $product->supplier_id,
            'user_id'          => $user?->id,
            'cost_price'       => $product->cost_price,
            'source'           => 'product_update',
            'effective_at'     => now(),
        ]);
    }

    public function recordQuote(Product $product, User $user, array $data): ProductCostHistory
    {
        return ProductCostHistory::create([
            'establishment_id' => $product->establishment_id,
            'product_id'       => $product->id,
            'supplier_id'      => $data['supplier_id'] ?? null,
            'user_id'          => $user->id,
            'cost_price'       => $data['cost_price'],
            'source'           => 'quote',
            'notes'            => $data['notes'] ?? null,
            'effective_at'     => $data['effective_at'] ?? now(),
        ]);
    }

    public function paginate(Product $product, array $filters): LengthAwarePaginator
    {
        $query = ProductCostHistory::query()
            ->with(['supplier:id,company_name', 'user:id,name'])
            ->where('product_id', $product->id)
            ->orderByDesc('effective_at');

        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (!empty($filters['source'])) {
            $query->where('source', $filters['source']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('effective_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('effective_at', '<=', $filters['date_to']);
        }

        return $query->paginate(20);
    }
}
