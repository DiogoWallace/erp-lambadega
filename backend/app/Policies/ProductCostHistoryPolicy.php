<?php

namespace App\Policies;

use App\Models\Product;
use App\Models\User;

class ProductCostHistoryPolicy
{
    public function viewAny(User $user, Product $product): bool
    {
        return $user->can('products.view') && $user->establishment_id === $product->establishment_id;
    }

    public function create(User $user, Product $product): bool
    {
        return $user->can('products.quote') && $user->establishment_id === $product->establishment_id;
    }
}
