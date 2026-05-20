<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProductService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Product::query()->with(['category:id,name', 'supplier:id,company_name']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (!empty($filters['supplier_id'])) {
            $query->where('supplier_id', $filters['supplier_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['low_stock'])) {
            $query->whereColumn('stock_quantity', '<=', 'min_stock_quantity');
        }

        return $query->orderBy('name')->paginate(15);
    }

    public function all(): Collection
    {
        return Product::query()->orderBy('name')->limit(500)->get(['id', 'name', 'stock_quantity', 'unit']);
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->fresh(['category:id,name', 'supplier:id,company_name']);
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
