<?php

namespace Database\Factories;

use App\Models\Establishment;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        return [
            'establishment_id'   => Establishment::factory(),
            'category_id'        => null,
            'supplier_id'        => null,
            'name'               => fake()->words(3, true),
            'description'        => fake()->optional()->sentence(),
            'brand'              => fake()->optional()->company(),
            'sku'                => null,
            'barcode'            => null,
            'unit'               => fake()->randomElement(['un', 'kg', 'g', 'l', 'ml', 'cx']),
            'cost_price'         => fake()->randomFloat(2, 1, 100),
            'sale_price'         => fake()->randomFloat(2, 5, 200),
            'stock_quantity'     => fake()->numberBetween(0, 100),
            'min_stock_quantity' => 5,
            'is_active'          => true,
        ];
    }
}
