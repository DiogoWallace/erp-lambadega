<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Establishment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'establishment_id' => Establishment::factory(),
            'type' => fake()->randomElement(['individual', 'company']),
            'name' => fake()->name(),
            'email' => fake()->optional()->safeEmail(),
            'phone' => fake()->optional()->numerify('(##) #####-####'),
            'is_active' => true,
        ];
    }
}
