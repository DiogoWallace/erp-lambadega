<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Establishment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'establishment_id' => Establishment::factory(),
            'name' => fake()->unique()->words(2, true),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
