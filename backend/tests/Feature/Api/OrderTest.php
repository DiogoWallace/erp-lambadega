<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use Tests\TestCase;

class OrderTest extends TestCase
{
    /**
     * @param array<string, mixed> $attrs
     */
    private function product(string $establishmentId, array $attrs = []): Product
    {
        return Product::factory()->create(array_merge([
            'establishment_id' => $establishmentId,
            'sale_price'       => 10.00,
            'cost_price'       => 4.00,
            'stock_quantity'   => 100,
        ], $attrs));
    }

    // ─── Authentication ──────────────────────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/orders')->assertUnauthorized();
    }

    // ─── Authorization ───────────────────────────────────────────────────────

    public function test_user_without_sales_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, role: '');

        $this->actingAsUser($user)
            ->getJson('/api/orders')
            ->assertForbidden();
    }

    public function test_user_without_sales_create_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro'); // só sales.view
        $product = $this->product($establishment->id);

        $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
            ])
            ->assertForbidden();
    }

    public function test_user_without_sales_edit_cannot_pay(): void
    {
        $establishment = $this->createEstablishment();
        $seller = $this->createUser($establishment, 'vendedor'); // view + create, sem edit
        $product = $this->product($establishment->id);

        $order = $this->actingAsUser($seller)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
            ])
            ->assertCreated()
            ->json('data');

        $this->actingAsUser($seller)
            ->postJson("/api/orders/{$order['id']}/pay", ['payment_method' => 'pix'])
            ->assertForbidden();
    }

    // ─── Create ──────────────────────────────────────────────────────────────

    public function test_admin_can_create_order_and_stock_is_decremented(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['stock_quantity' => 100]);

        $response = $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 3]],
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.subtotal_amount', '30.00')
            ->assertJsonPath('data.total_amount', '30.00');

        $orderId = $response->json('data.id');

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_quantity' => 97]);
        $this->assertDatabaseHas('order_items', ['order_id' => $orderId, 'product_id' => $product->id, 'quantity' => 3]);
        $this->assertDatabaseHas('stock_movements', [
            'reference_id' => $orderId,
            'product_id'   => $product->id,
            'type'         => 'out',
            'quantity'     => 3,
        ]);
    }

    public function test_create_computes_subtotal_for_multiple_items(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $a = $this->product($establishment->id, ['sale_price' => 10.00]);
        $b = $this->product($establishment->id, ['sale_price' => 25.00]);

        $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items' => [
                    ['product_id' => $a->id, 'quantity' => 2], // 20.00
                    ['product_id' => $b->id, 'quantity' => 1], // 25.00
                ],
            ])
            ->assertCreated()
            ->assertJsonPath('data.total_amount', '45.00')
            ->assertJsonCount(2, 'data.items');
    }

    public function test_create_applies_fixed_order_discount(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['sale_price' => 10.00]);

        $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items'           => [['product_id' => $product->id, 'quantity' => 2]], // 20.00
                'discount_type'   => 'fixed',
                'discount_amount' => 5,
            ])
            ->assertCreated()
            ->assertJsonPath('data.discount_amount', '5.00')
            ->assertJsonPath('data.total_amount', '15.00');
    }

    public function test_create_applies_percentage_order_discount(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['sale_price' => 10.00]);

        $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items'           => [['product_id' => $product->id, 'quantity' => 2]], // 20.00
                'discount_type'   => 'percentage',
                'discount_amount' => 10, // 10% => 2.00
            ])
            ->assertCreated()
            ->assertJsonPath('data.discount_amount', '2.00')
            ->assertJsonPath('data.total_amount', '18.00');
    }

    public function test_create_honors_per_item_unit_price_override(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['sale_price' => 10.00]);

        $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 2, 'unit_price' => 8]],
            ])
            ->assertCreated()
            ->assertJsonPath('data.total_amount', '16.00');
    }

    public function test_create_with_payment_method_pays_immediately(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['sale_price' => 10.00]);

        $response = $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items'          => [['product_id' => $product->id, 'quantity' => 1]],
                'payment_method' => 'cash',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'paid')
            ->assertJsonPath('data.payment_method', 'cash');

        $this->assertDatabaseHas('financial_transactions', [
            'order_id' => $response->json('data.id'),
            'type'     => 'income',
            'status'   => 'paid',
            'amount'   => 10.00,
        ]);
    }

    public function test_create_fails_when_stock_insufficient(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['stock_quantity' => 1]);

        $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 5]],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items']);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_quantity' => 1]);
    }

    public function test_create_validates_required_items(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/orders', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items']);
    }

    public function test_cannot_create_order_with_product_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $product = $this->product($theirs->id);

        $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['items.0.product_id']);
    }

    // ─── Pay ─────────────────────────────────────────────────────────────────

    public function test_pay_generates_installment_transactions(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['sale_price' => 10.00]);

        $order = $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 2]], // total 20.00
            ])
            ->json('data');

        $this->actingAsUser($user)
            ->postJson("/api/orders/{$order['id']}/pay", [
                'payment_method' => 'credit_card',
                'installments'   => 3,
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        // 3 parcelas, todas pendentes (>1 parcela), installment_count = 3
        $this->assertDatabaseCount('financial_transactions', 3);
        $this->assertEquals(
            3,
            \App\Models\FinancialTransaction::where('order_id', $order['id'])
                ->where('status', 'pending')
                ->where('installment_count', 3)
                ->count()
        );
    }

    public function test_cannot_pay_an_already_paid_order(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id);

        $order = $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items'          => [['product_id' => $product->id, 'quantity' => 1]],
                'payment_method' => 'pix',
            ])
            ->json('data');

        $this->actingAsUser($user)
            ->postJson("/api/orders/{$order['id']}/pay", ['payment_method' => 'pix'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    // ─── Cancel ──────────────────────────────────────────────────────────────

    public function test_cancel_pending_order_restores_stock(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['stock_quantity' => 100]);

        // Pedido pendente (não pago) — único estado que cancel() aceita hoje.
        $order = $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 4]],
            ])
            ->json('data');

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_quantity' => 96]);

        $this->actingAsUser($user)
            ->postJson("/api/orders/{$order['id']}/cancel")
            ->assertOk();

        $this->assertDatabaseHas('orders', ['id' => $order['id'], 'status' => 'canceled']);
        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_quantity' => 100]);
        $this->assertDatabaseHas('stock_movements', [
            'reference_id' => $order['id'],
            'type'         => 'in',
            'quantity'     => 4,
        ]);
    }

    public function test_cannot_cancel_a_paid_order(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id);

        $order = $this->actingAsUser($user)
            ->postJson('/api/orders', [
                'items'          => [['product_id' => $product->id, 'quantity' => 1]],
                'payment_method' => 'pix', // paga na hora → status paid
            ])
            ->json('data');

        $this->actingAsUser($user)
            ->postJson("/api/orders/{$order['id']}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    // ─── Show / multi-tenant ───────────────────────────────────────────────────

    public function test_cannot_show_order_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $ourUser = $this->createUser($ours);
        $theirUser = $this->createUser($theirs);
        $product = $this->product($theirs->id);

        $order = $this->actingAsUser($theirUser)
            ->postJson('/api/orders', [
                'items' => [['product_id' => $product->id, 'quantity' => 1]],
            ])
            ->json('data');

        $this->actingAsUser($ourUser)
            ->getJson("/api/orders/{$order['id']}")
            ->assertNotFound();
    }
}
