<?php

namespace Tests\Feature\Api;

use App\Models\Supplier;
use Tests\TestCase;

class SupplierTest extends TestCase
{
    // ─── Authentication ────────────────────────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/suppliers')->assertUnauthorized();
    }

    // ─── Authorization ─────────────────────────────────────────────────────────

    public function test_user_without_suppliers_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, role: '');

        $this->actingAsUser($user)
            ->getJson('/api/suppliers')
            ->assertForbidden();
    }

    public function test_user_without_suppliers_create_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro');

        $this->actingAsUser($user)
            ->postJson('/api/suppliers', ['company_name' => 'Test Corp'])
            ->assertForbidden();
    }

    public function test_user_without_suppliers_delete_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro');
        $supplier = Supplier::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/suppliers/{$supplier->id}")
            ->assertForbidden();
    }

    // ─── Index ─────────────────────────────────────────────────────────────────

    public function test_admin_can_list_suppliers(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Supplier::factory()->count(3)->create(['establishment_id' => $establishment->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/suppliers')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links']);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_is_scoped_to_own_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);

        Supplier::factory()->count(2)->create(['establishment_id' => $ours->id]);
        Supplier::factory()->count(4)->create(['establishment_id' => $theirs->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/suppliers')
            ->assertOk();

        $this->assertCount(2, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_search(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Supplier::factory()->create(['establishment_id' => $establishment->id, 'company_name' => 'Distribuidora ABC']);
        Supplier::factory()->create(['establishment_id' => $establishment->id, 'company_name' => 'Fornecedor XYZ']);

        $response = $this->actingAsUser($user)
            ->getJson('/api/suppliers?search=ABC')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Distribuidora ABC', $response->json('data.0.company_name'));
    }

    public function test_list_can_be_filtered_by_is_active(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Supplier::factory()->count(2)->create(['establishment_id' => $establishment->id, 'is_active' => true]);
        Supplier::factory()->count(3)->create(['establishment_id' => $establishment->id, 'is_active' => false]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/suppliers?is_active=0')
            ->assertOk();

        $this->assertCount(3, $response->json('data'));
    }

    // ─── Show ──────────────────────────────────────────────────────────────────

    public function test_admin_can_show_supplier(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $supplier = Supplier::factory()->create([
            'establishment_id' => $establishment->id,
            'company_name'     => 'Fornecedor Teste',
        ]);

        $this->actingAsUser($user)
            ->getJson("/api/suppliers/{$supplier->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $supplier->id)
            ->assertJsonPath('data.company_name', 'Fornecedor Teste');
    }

    public function test_cannot_show_supplier_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $supplier = Supplier::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->getJson("/api/suppliers/{$supplier->id}")
            ->assertNotFound();
    }

    // ─── Store ─────────────────────────────────────────────────────────────────

    public function test_admin_can_create_supplier(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/suppliers', [
                'company_name' => 'Nova Empresa Ltda',
                'email'        => 'contato@nova.com',
                'is_active'    => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.company_name', 'Nova Empresa Ltda')
            ->assertJsonPath('data.establishment_id', $establishment->id);

        $this->assertDatabaseHas('suppliers', [
            'establishment_id' => $establishment->id,
            'company_name'     => 'Nova Empresa Ltda',
        ]);
    }

    public function test_store_validates_required_company_name(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/suppliers', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['company_name']);
    }

    public function test_store_validates_cnpj_unique_per_establishment(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Supplier::factory()->create(['establishment_id' => $establishment->id, 'cnpj' => '12345678000190']);

        $this->actingAsUser($user)
            ->postJson('/api/suppliers', ['company_name' => 'Outro', 'cnpj' => '12345678000190'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['cnpj']);
    }

    public function test_same_cnpj_allowed_in_different_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        Supplier::factory()->create(['establishment_id' => $theirs->id, 'cnpj' => '12345678000190']);

        $this->actingAsUser($user)
            ->postJson('/api/suppliers', ['company_name' => 'Meu Fornecedor', 'cnpj' => '12345678000190'])
            ->assertCreated();
    }

    // ─── Update ────────────────────────────────────────────────────────────────

    public function test_admin_can_update_supplier(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $supplier = Supplier::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->putJson("/api/suppliers/{$supplier->id}", ['company_name' => 'Atualizada Ltda'])
            ->assertOk()
            ->assertJsonPath('data.company_name', 'Atualizada Ltda');

        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id, 'company_name' => 'Atualizada Ltda']);
    }

    public function test_cannot_update_supplier_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $supplier = Supplier::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->putJson("/api/suppliers/{$supplier->id}", ['company_name' => 'Hacked'])
            ->assertNotFound();
    }

    // ─── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_can_soft_delete_supplier(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $supplier = Supplier::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/suppliers/{$supplier->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('suppliers', ['id' => $supplier->id]);
    }

    public function test_cannot_delete_supplier_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $supplier = Supplier::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/suppliers/{$supplier->id}")
            ->assertNotFound();
    }
}
