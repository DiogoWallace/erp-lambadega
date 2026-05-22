<?php

namespace Database\Factories;

use App\Models\Establishment;
use App\Models\FinancialTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FinancialTransaction>
 */
class FinancialTransactionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'establishment_id' => Establishment::factory(),
            'order_id'         => null,
            'user_id'          => null,
            'supplier_id'      => null,
            'customer_id'      => null,
            'type'             => 'expense',
            'category'         => 'utilities',
            'description'      => fake()->sentence(3),
            'amount'           => fake()->randomFloat(2, 10, 1000),
            'payment_method'   => null,
            'due_date'         => fake()->dateTimeBetween('now', '+30 days')->format('Y-m-d'),
            'payment_date'     => null,
            'status'           => 'pending',
            'notes'            => null,
        ];
    }

    public function income(): static
    {
        return $this->state(fn () => ['type' => 'income', 'category' => 'sales']);
    }

    public function paid(): static
    {
        return $this->state(fn () => [
            'status'       => 'paid',
            'payment_date' => now()->toDateString(),
        ]);
    }
}
