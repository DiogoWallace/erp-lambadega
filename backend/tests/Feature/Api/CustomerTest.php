<?php

namespace Tests\Feature\Api;

use App\Models\Customer;
use App\Models\Establishment;
use App\Models\User;
use Tests\TestCase;

class CustomerTest extends TestCase
{
    // ─── Authentication ────────────────────────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/customers')->assertUnauthorized();
    }

    // ─── Authorization (permissions) ───────────────────────────────────────────

    public function test_user_without_customers_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        // all named roles have customers.view; use a user with no role
        $user = $this->createUser($establishment, role: '');

        $this->actingAsUser($user)
            ->getJson('/api/customers')
            ->assertForbidden();
    }

    public function test_user_without_customers_create_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro');

        $this->actingAsUser($user)
            ->postJson('/api/customers', ['name' => 'Test', 'type' => 'individual'])
            ->assertForbidden();
    }

    public function test_user_without_customers_edit_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro');
        $customer = Customer::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->putJson("/api/customers/{$customer->id}", ['name' => 'Updated'])
            ->assertForbidden();
    }

    public function test_user_without_customers_delete_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro');
        $customer = Customer::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/customers/{$customer->id}")
            ->assertForbidden();
    }

    // ─── Index ─────────────────────────────────────────────────────────────────

    public function test_admin_can_list_customers(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Customer::factory()->count(3)->create(['establishment_id' => $establishment->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/customers')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links']);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_is_scoped_to_own_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);

        Customer::factory()->count(2)->create(['establishment_id' => $ours->id]);
        Customer::factory()->count(5)->create(['establishment_id' => $theirs->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/customers')
            ->assertOk();

        $this->assertCount(2, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_search(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Customer::factory()->create(['establishment_id' => $establishment->id, 'name' => 'João Silva']);
        Customer::factory()->create(['establishment_id' => $establishment->id, 'name' => 'Maria Souza']);

        $response = $this->actingAsUser($user)
            ->getJson('/api/customers?search=João')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('João Silva', $response->json('data.0.name'));
    }

    public function test_list_can_be_filtered_by_is_active(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Customer::factory()->count(3)->create(['establishment_id' => $establishment->id, 'is_active' => true]);
        Customer::factory()->count(2)->create(['establishment_id' => $establishment->id, 'is_active' => false]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/customers?is_active=1')
            ->assertOk();

        $this->assertCount(3, $response->json('data'));
    }

    // ─── Show ──────────────────────────────────────────────────────────────────

    public function test_admin_can_show_customer(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $customer = Customer::factory()->create([
            'establishment_id' => $establishment->id,
            'name' => 'Test Customer',
        ]);

        $this->actingAsUser($user)
            ->getJson("/api/customers/{$customer->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $customer->id)
            ->assertJsonPath('data.name', 'Test Customer');
    }

    public function test_cannot_show_customer_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $customer = Customer::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->getJson("/api/customers/{$customer->id}")
            ->assertNotFound();
    }

    // ─── Store ─────────────────────────────────────────────────────────────────

    public function test_admin_can_create_customer(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/customers', [
                'name' => 'Novo Cliente',
                'type' => 'individual',
                'email' => 'novo@example.com',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Novo Cliente')
            ->assertJsonPath('data.establishment_id', $establishment->id);

        $this->assertDatabaseHas('customers', [
            'establishment_id' => $establishment->id,
            'name' => 'Novo Cliente',
        ]);
    }

    public function test_store_validates_required_name(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/customers', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_store_validates_invalid_type(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/customers', ['name' => 'Test', 'type' => 'invalid'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    // ─── Update ────────────────────────────────────────────────────────────────

    public function test_admin_can_update_customer(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $customer = Customer::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->putJson("/api/customers/{$customer->id}", ['name' => 'Updated Name'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');

        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'name' => 'Updated Name']);
    }

    public function test_cannot_update_customer_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $customer = Customer::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->putJson("/api/customers/{$customer->id}", ['name' => 'Hacked'])
            ->assertNotFound();
    }

    // ─── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_can_soft_delete_customer(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $customer = Customer::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/customers/{$customer->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('customers', ['id' => $customer->id]);
    }

    public function test_cannot_delete_customer_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $customer = Customer::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/customers/{$customer->id}")
            ->assertNotFound();
    }
}
