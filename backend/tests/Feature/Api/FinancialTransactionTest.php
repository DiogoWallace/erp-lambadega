<?php

namespace Tests\Feature\Api;

use App\Models\FinancialTransaction;
use App\Models\Product;
use App\Models\Supplier;
use Tests\TestCase;

class FinancialTransactionTest extends TestCase
{
    // ─── Authentication / Authorization ──────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/financial-transactions')->assertUnauthorized();
    }

    public function test_user_without_finance_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'vendedor'); // sem finance.*

        $this->actingAsUser($user)
            ->getJson('/api/financial-transactions')
            ->assertForbidden();
    }

    public function test_manager_cannot_delete_without_finance_delete(): void
    {
        $establishment = $this->createEstablishment();
        $manager = $this->createUser($establishment, 'gerente'); // view/create/edit, sem delete
        $tx = FinancialTransaction::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($manager)
            ->deleteJson("/api/financial-transactions/{$tx->id}")
            ->assertForbidden();
    }

    // ─── Index ───────────────────────────────────────────────────────────────

    public function test_admin_can_list_transactions(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        FinancialTransaction::factory()->count(3)->create(['establishment_id' => $establishment->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/financial-transactions')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links']);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_is_scoped_to_own_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);

        FinancialTransaction::factory()->create(['establishment_id' => $ours->id]);
        FinancialTransaction::factory()->create(['establishment_id' => $theirs->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/financial-transactions')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_type(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        FinancialTransaction::factory()->count(2)->create(['establishment_id' => $establishment->id]); // expense
        FinancialTransaction::factory()->income()->create(['establishment_id' => $establishment->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/financial-transactions?type=income')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('income', $response->json('data.0.type'));
    }

    // ─── Store ─────────────────────────────────────────────────────────────────

    public function test_admin_can_create_expense(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $supplier = Supplier::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->postJson('/api/financial-transactions', [
                'type'        => 'expense',
                'category'    => 'utilities',
                'description' => 'Conta de energia',
                'amount'      => 350.90,
                'due_date'    => '2026-06-10',
                'supplier_id' => $supplier->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.type', 'expense')
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.amount', '350.90');

        $this->assertDatabaseHas('financial_transactions', [
            'establishment_id' => $establishment->id,
            'description'      => 'Conta de energia',
            'user_id'          => $user->id,
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/financial-transactions', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type', 'description', 'amount', 'due_date']);
    }

    public function test_store_rejects_zero_amount(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/financial-transactions', [
                'type'        => 'expense',
                'description' => 'Teste',
                'amount'      => 0,
                'due_date'    => '2026-06-10',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_cannot_create_with_supplier_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $supplier = Supplier::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->postJson('/api/financial-transactions', [
                'type'        => 'expense',
                'description' => 'Teste',
                'amount'      => 100,
                'due_date'    => '2026-06-10',
                'supplier_id' => $supplier->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['supplier_id']);
    }

    // ─── Show / Update / Delete ──────────────────────────────────────────────

    public function test_cannot_show_transaction_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $tx = FinancialTransaction::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->getJson("/api/financial-transactions/{$tx->id}")
            ->assertNotFound();
    }

    public function test_admin_can_update_transaction(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $tx = FinancialTransaction::factory()->create([
            'establishment_id' => $establishment->id,
            'amount'           => 100,
        ]);

        $this->actingAsUser($user)
            ->putJson("/api/financial-transactions/{$tx->id}", [
                'amount'      => 250.50,
                'description' => 'Atualizado',
            ])
            ->assertOk()
            ->assertJsonPath('data.amount', '250.50')
            ->assertJsonPath('data.description', 'Atualizado');
    }

    public function test_admin_can_soft_delete_transaction(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $tx = FinancialTransaction::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/financial-transactions/{$tx->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('financial_transactions', ['id' => $tx->id]);
    }

    // ─── Pay ─────────────────────────────────────────────────────────────────

    public function test_pay_marks_transaction_as_paid(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $tx = FinancialTransaction::factory()->create([
            'establishment_id' => $establishment->id,
            'status'           => 'pending',
        ]);

        $this->actingAsUser($user)
            ->postJson("/api/financial-transactions/{$tx->id}/pay", [
                'payment_date'   => '2026-05-22',
                'payment_method' => 'pix',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.payment_date', '2026-05-22')
            ->assertJsonPath('data.payment_method', 'pix');
    }

    // ─── Integração com Vendas ───────────────────────────────────────────────

    public function test_paying_an_order_creates_an_income_receivable(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'sale_price'       => 50.00,
            'stock_quantity'   => 10,
        ]);

        $this->actingAsUser($user)->postJson('/api/orders', [
            'items'          => [['product_id' => $product->id, 'quantity' => 1]],
            'payment_method' => 'pix',
        ])->assertCreated();

        $response = $this->actingAsUser($user)
            ->getJson('/api/financial-transactions?type=income')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('sales', $response->json('data.0.category'));
        $this->assertEquals('paid', $response->json('data.0.status'));
    }
}
