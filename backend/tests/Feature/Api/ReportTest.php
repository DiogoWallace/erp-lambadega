<?php

namespace Tests\Feature\Api;

use App\Models\FinancialTransaction;
use App\Models\Product;
use Tests\TestCase;

class ReportTest extends TestCase
{
    private function product(string $establishmentId, array $attrs = []): Product
    {
        return Product::factory()->create(array_merge([
            'establishment_id' => $establishmentId,
            'sale_price'       => 10.00,
            'cost_price'       => 4.00,
            'stock_quantity'   => 100,
        ], $attrs));
    }

    // ─── Auth / authorization ────────────────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/reports/sales')->assertUnauthorized();
        $this->getJson('/api/reports/top-products')->assertUnauthorized();
        $this->getJson('/api/reports/cash-flow')->assertUnauthorized();
        $this->getJson('/api/reports/accounts')->assertUnauthorized();
    }

    public function test_user_without_reports_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'vendedor'); // sem reports.view

        $this->actingAsUser($user)->getJson('/api/reports/sales')->assertForbidden();
        $this->actingAsUser($user)->getJson('/api/reports/top-products')->assertForbidden();
        $this->actingAsUser($user)->getJson('/api/reports/cash-flow')->assertForbidden();
        $this->actingAsUser($user)->getJson('/api/reports/accounts')->assertForbidden();
    }

    // ─── Sales report ────────────────────────────────────────────────────────

    public function test_sales_report_aggregates_paid_orders(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['sale_price' => 50]);

        $order1 = $this->actingAsUser($user)
            ->postJson('/api/orders', ['items' => [['product_id' => $product->id, 'quantity' => 2]]])
            ->json('data');
        $this->actingAsUser($user)->postJson("/api/orders/{$order1['id']}/pay", ['payment_method' => 'pix']);

        $this->actingAsUser($user)
            ->postJson('/api/orders', ['items' => [['product_id' => $product->id, 'quantity' => 1]]]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/reports/sales')
            ->assertOk();

        $this->assertSame(2, $response->json('data.totals.orders'));
        $this->assertSame(1, $response->json('data.totals.paid'));
        $this->assertSame(1, $response->json('data.totals.pending'));
        $this->assertEquals(100.0, $response->json('data.totals.revenue'));
        $this->assertEquals(100.0, $response->json('data.totals.avg_ticket'));
    }

    public function test_sales_report_filters_by_status(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id);

        $order = $this->actingAsUser($user)
            ->postJson('/api/orders', ['items' => [['product_id' => $product->id, 'quantity' => 1]]])
            ->json('data');
        $this->actingAsUser($user)->postJson("/api/orders/{$order['id']}/pay", ['payment_method' => 'pix']);

        $this->actingAsUser($user)
            ->postJson('/api/orders', ['items' => [['product_id' => $product->id, 'quantity' => 1]]]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/reports/sales?status=paid')
            ->assertOk();

        $this->assertCount(1, $response->json('data.orders'));
        $this->assertSame('paid', $response->json('data.orders.0.status'));
    }

    public function test_sales_report_is_scoped_to_own_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $us = $this->createUser($ours);
        $them = $this->createUser($theirs);

        $ourProduct = $this->product($ours->id);
        $theirProduct = $this->product($theirs->id);

        $this->actingAsUser($us)->postJson('/api/orders', ['items' => [['product_id' => $ourProduct->id, 'quantity' => 1]]]);
        $this->actingAsUser($them)->postJson('/api/orders', ['items' => [['product_id' => $theirProduct->id, 'quantity' => 5]]]);

        $response = $this->actingAsUser($us)
            ->getJson('/api/reports/sales')
            ->assertOk();

        $this->assertSame(1, $response->json('data.totals.orders'));
    }

    // ─── Top products ────────────────────────────────────────────────────────

    public function test_top_products_ranks_by_revenue(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $cheap = $this->product($establishment->id, ['sale_price' => 5, 'name' => 'Cheap']);
        $premium = $this->product($establishment->id, ['sale_price' => 100, 'name' => 'Premium']);

        // Premium: 2x100 = 200
        $orderA = $this->actingAsUser($user)
            ->postJson('/api/orders', ['items' => [['product_id' => $premium->id, 'quantity' => 2]]])
            ->json('data');
        $this->actingAsUser($user)->postJson("/api/orders/{$orderA['id']}/pay", ['payment_method' => 'pix']);

        // Cheap: 10x5 = 50
        $orderB = $this->actingAsUser($user)
            ->postJson('/api/orders', ['items' => [['product_id' => $cheap->id, 'quantity' => 10]]])
            ->json('data');
        $this->actingAsUser($user)->postJson("/api/orders/{$orderB['id']}/pay", ['payment_method' => 'pix']);

        $response = $this->actingAsUser($user)
            ->getJson('/api/reports/top-products')
            ->assertOk();

        $items = $response->json('data.items');
        $this->assertSame('Premium', $items[0]['product_name']);
        $this->assertEquals(200.0, $items[0]['revenue']);
        $this->assertSame(2, $items[0]['quantity']);
        $this->assertSame('Cheap', $items[1]['product_name']);
        $this->assertEquals(50.0, $items[1]['revenue']);
    }

    public function test_top_products_ignores_unpaid_orders(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id, ['sale_price' => 30]);

        $this->actingAsUser($user)
            ->postJson('/api/orders', ['items' => [['product_id' => $product->id, 'quantity' => 5]]]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/reports/top-products')
            ->assertOk();

        $this->assertCount(0, $response->json('data.items'));
    }

    // ─── Cash flow ───────────────────────────────────────────────────────────

    public function test_cash_flow_aggregates_realized_and_pending(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        FinancialTransaction::factory()->income()->paid()->create([
            'establishment_id' => $establishment->id,
            'amount'           => 500,
            'due_date'         => now()->toDateString(),
        ]);

        FinancialTransaction::factory()->create([
            'establishment_id' => $establishment->id,
            'type'             => 'expense',
            'status'           => 'pending',
            'amount'           => 200,
            'due_date'         => now()->toDateString(),
        ]);

        $from = now()->startOfMonth()->toDateString();
        $to   = now()->endOfMonth()->toDateString();

        $response = $this->actingAsUser($user)
            ->getJson("/api/reports/cash-flow?date_from={$from}&date_to={$to}")
            ->assertOk();

        $this->assertEquals(500.0, $response->json('data.totals.income_realized'));
        $this->assertEquals(0.0, $response->json('data.totals.expense_realized'));
        $this->assertEquals(200.0, $response->json('data.totals.expense_pending'));
        $this->assertEquals(500.0, $response->json('data.totals.net_realized'));
        $this->assertEquals(300.0, $response->json('data.totals.net_projected'));
    }

    public function test_cash_flow_builds_one_row_per_day(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $from = now()->startOfMonth()->toDateString();
        $to   = now()->startOfMonth()->addDays(2)->toDateString();

        $response = $this->actingAsUser($user)
            ->getJson("/api/reports/cash-flow?date_from={$from}&date_to={$to}")
            ->assertOk();

        $this->assertCount(3, $response->json('data.by_day'));
    }

    // ─── Accounts status ─────────────────────────────────────────────────────

    public function test_accounts_summarizes_by_status(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        FinancialTransaction::factory()->count(2)->create([
            'establishment_id' => $establishment->id, 'status' => 'pending', 'amount' => 100,
        ]);
        FinancialTransaction::factory()->paid()->create([
            'establishment_id' => $establishment->id, 'amount' => 50,
        ]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/reports/accounts')
            ->assertOk();

        $this->assertSame(3, $response->json('data.totals.count'));
        $this->assertSame(2, $response->json('data.by_status.pending.count'));
        $this->assertEquals(200.0, $response->json('data.by_status.pending.total'));
        $this->assertSame(1, $response->json('data.by_status.paid.count'));
    }

    public function test_accounts_filters_by_type(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        FinancialTransaction::factory()->create([
            'establishment_id' => $establishment->id, 'type' => 'expense',
        ]);
        FinancialTransaction::factory()->income()->create([
            'establishment_id' => $establishment->id,
        ]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/reports/accounts?type=income')
            ->assertOk();

        $this->assertSame(1, $response->json('data.totals.count'));
        $this->assertSame('income', $response->json('data.items.0.type'));
    }

    // ─── CSV export ──────────────────────────────────────────────────────────

    public function test_sales_csv_export_returns_text_csv(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = $this->product($establishment->id);

        $this->actingAsUser($user)
            ->postJson('/api/orders', ['items' => [['product_id' => $product->id, 'quantity' => 1]]]);

        $response = $this->actingAsUser($user)
            ->get('/api/reports/sales?format=csv')
            ->assertOk();

        $this->assertStringContainsString('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringStartsWith('attachment;', $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('Pedido', $response->streamedContent());
    }

    public function test_accounts_csv_export_lists_transactions(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        FinancialTransaction::factory()->create([
            'establishment_id' => $establishment->id,
            'description'      => 'Aluguel de maio',
            'amount'           => 1234.56,
        ]);

        $response = $this->actingAsUser($user)
            ->get('/api/reports/accounts?format=csv')
            ->assertOk();

        $body = $response->streamedContent();
        $this->assertStringContainsString('Aluguel de maio', $body);
        $this->assertStringContainsString('1234.56', $body);
    }
}
