<?php

namespace Tests\Feature;

use App\Models\FinancialTransaction;
use Tests\TestCase;

class MarkOverdueTransactionsTest extends TestCase
{
    public function test_marks_past_due_pending_transactions_as_overdue(): void
    {
        $establishment = $this->createEstablishment();

        $overdue = FinancialTransaction::factory()->create([
            'establishment_id' => $establishment->id,
            'status'           => 'pending',
            'due_date'         => now()->subDay()->toDateString(),
        ]);

        $this->artisan('finance:mark-overdue')
            ->expectsOutputToContain('1 transação(ões) marcada(s) como vencida(s).')
            ->assertSuccessful();

        $this->assertDatabaseHas('financial_transactions', [
            'id'     => $overdue->id,
            'status' => 'overdue',
        ]);
    }

    public function test_does_not_touch_future_or_non_pending_transactions(): void
    {
        $establishment = $this->createEstablishment();

        $future = FinancialTransaction::factory()->create([
            'establishment_id' => $establishment->id,
            'status'           => 'pending',
            'due_date'         => now()->addWeek()->toDateString(),
        ]);
        $paid = FinancialTransaction::factory()->create([
            'establishment_id' => $establishment->id,
            'status'           => 'paid',
            'due_date'         => now()->subWeek()->toDateString(),
        ]);

        $this->artisan('finance:mark-overdue')->assertSuccessful();

        $this->assertDatabaseHas('financial_transactions', ['id' => $future->id, 'status' => 'pending']);
        $this->assertDatabaseHas('financial_transactions', ['id' => $paid->id, 'status' => 'paid']);
    }

    public function test_processes_all_establishments(): void
    {
        $a = $this->createEstablishment();
        $b = $this->createEstablishment();

        $txA = FinancialTransaction::factory()->create([
            'establishment_id' => $a->id,
            'status'           => 'pending',
            'due_date'         => now()->subDay()->toDateString(),
        ]);
        $txB = FinancialTransaction::factory()->create([
            'establishment_id' => $b->id,
            'status'           => 'pending',
            'due_date'         => now()->subDay()->toDateString(),
        ]);

        $this->artisan('finance:mark-overdue')->assertSuccessful();

        $this->assertDatabaseHas('financial_transactions', ['id' => $txA->id, 'status' => 'overdue']);
        $this->assertDatabaseHas('financial_transactions', ['id' => $txB->id, 'status' => 'overdue']);
    }
}
