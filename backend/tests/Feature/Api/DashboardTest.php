<?php

namespace Tests\Feature\Api;

use App\Models\Order;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    private function createPaidOrder(string $establishmentId, string $userId, float $amount): Order
    {
        return Order::create([
            'establishment_id' => $establishmentId,
            'user_id'          => $userId,
            'order_number'     => 'ORD-' . uniqid(),
            'subtotal_amount'  => $amount,
            'total_amount'     => $amount,
            'status'           => 'paid',
            'payment_method'   => 'cash',
            'paid_at'          => now(),
        ]);
    }

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/dashboard')->assertUnauthorized();
    }

    public function test_admin_sees_all_orders_of_establishment(): void
    {
        $establishment = $this->createEstablishment();
        $admin    = $this->createUser($establishment, 'admin');
        $vendedor = $this->createUser($establishment, 'vendedor');

        $this->createPaidOrder($establishment->id, $vendedor->id, 100);
        $this->createPaidOrder($establishment->id, $vendedor->id, 100);
        $this->createPaidOrder($establishment->id, $admin->id, 50);

        $this->actingAsUser($admin)
            ->getJson('/api/dashboard?period=month')
            ->assertOk()
            ->assertJsonPath('data.scope', 'all')
            ->assertJsonPath('data.orders.paid', 3)
            ->assertJsonPath('data.revenue.current', '250.00');
    }

    public function test_vendedor_sees_only_own_orders(): void
    {
        $establishment = $this->createEstablishment();
        $admin    = $this->createUser($establishment, 'admin');
        $vendedor = $this->createUser($establishment, 'vendedor');

        $this->createPaidOrder($establishment->id, $vendedor->id, 100);
        $this->createPaidOrder($establishment->id, $vendedor->id, 100);
        $this->createPaidOrder($establishment->id, $admin->id, 50);

        $this->actingAsUser($vendedor)
            ->getJson('/api/dashboard?period=month')
            ->assertOk()
            ->assertJsonPath('data.scope', 'self')
            ->assertJsonPath('data.orders.paid', 2)
            ->assertJsonPath('data.revenue.current', '200.00');
    }

    public function test_gerente_sees_all_orders(): void
    {
        $establishment = $this->createEstablishment();
        $gerente  = $this->createUser($establishment, 'gerente');
        $vendedor = $this->createUser($establishment, 'vendedor');

        $this->createPaidOrder($establishment->id, $vendedor->id, 80);
        $this->createPaidOrder($establishment->id, $vendedor->id, 80);
        $this->createPaidOrder($establishment->id, $vendedor->id, 80);

        $this->actingAsUser($gerente)
            ->getJson('/api/dashboard?period=month')
            ->assertOk()
            ->assertJsonPath('data.scope', 'all')
            ->assertJsonPath('data.orders.paid', 3);
    }

    public function test_financeiro_sees_all_orders(): void
    {
        $establishment = $this->createEstablishment();
        $financeiro = $this->createUser($establishment, 'financeiro');
        $vendedor   = $this->createUser($establishment, 'vendedor');

        $this->createPaidOrder($establishment->id, $vendedor->id, 80);
        $this->createPaidOrder($establishment->id, $vendedor->id, 80);
        $this->createPaidOrder($establishment->id, $vendedor->id, 80);

        $this->actingAsUser($financeiro)
            ->getJson('/api/dashboard?period=month')
            ->assertOk()
            ->assertJsonPath('data.scope', 'all')
            ->assertJsonPath('data.orders.paid', 3);
    }
}
