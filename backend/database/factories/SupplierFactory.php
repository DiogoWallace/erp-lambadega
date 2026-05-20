<?php

namespace Database\Factories;

use App\Models\Establishment;
use App\Models\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Supplier>
 */
class SupplierFactory extends Factory
{
    public function definition(): array
    {
        return [
            'establishment_id' => Establishment::factory(),
            'company_name'     => fake()->company(),
            'trade_name'       => fake()->optional()->company(),
            'contact_name'     => fake()->optional()->name(),
            'email'            => fake()->optional()->safeEmail(),
            'phone'            => fake()->optional()->numerify('(##) ####-####'),
            'is_active'        => true,
        ];
    }
}
