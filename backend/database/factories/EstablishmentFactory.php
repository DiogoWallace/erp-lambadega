<?php

namespace Database\Factories;

use App\Models\Establishment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Establishment>
 */
class EstablishmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'trade_name' => fake()->optional()->company(),
            'is_active' => true,
        ];
    }
}
