<?php

namespace App\Services;

use App\Models\Category;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Category::with('parent:id,name');

        if (!empty($filters['search'])) {
            $query->where('name', 'like', "%{$filters['search']}%");
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== '') {
            $query->where('is_active', filter_var($filters['is_active'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->orderBy('sort_order')->orderBy('name')->paginate(15);
    }

    public function all(): Collection
    {
        return Category::orderBy('sort_order')->orderBy('name')->limit(500)->get(['id', 'name', 'parent_id']);
    }

    public function create(array $data): Category
    {
        return Category::create($data);
    }

    public function update(Category $category, array $data): Category
    {
        $category->update($data);

        return $category->fresh('parent');
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }
}
