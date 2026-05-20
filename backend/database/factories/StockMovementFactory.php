<?php

namespace Database\Factories;

use App\Models\Establishment;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StockMovement>
 */
class StockMovementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'establishment_id' => Establishment::factory(),
            'product_id'       => Product::factory(),
            'user_id'          => User::factory(),
            'type'             => 'in',
            'quantity'         => fake()->numberBetween(1, 50),
            'stock_before'     => 10,
            'stock_after'      => 10,
            'cost_price'       => null,
            'description'      => fake()->optional()->sentence(),
        ];
    }
}
