<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Tests\TestCase;

class UserTest extends TestCase
{
    // ─── Authentication ────────────────────────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
    }

    // ─── Authorization ─────────────────────────────────────────────────────────

    public function test_user_without_users_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, role: '');

        $this->actingAsUser($user)
            ->getJson('/api/users')
            ->assertForbidden();
    }

    public function test_user_without_users_create_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'gerente');

        $this->actingAsUser($user)
            ->postJson('/api/users', [
                'name'     => 'Teste',
                'email'    => 'teste@example.com',
                'password' => 'segredo123',
                'role'     => 'vendedor',
            ])
            ->assertForbidden();
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    public function test_admin_can_list_users_of_own_establishment(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');

        $other = $this->createEstablishment();
        $this->createUser($other, 'admin');

        $this->actingAsUser($admin)
            ->getJson('/api/users')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $admin->id);
    }

    public function test_admin_can_create_user(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');

        $payload = [
            'name'     => 'Novo Vendedor',
            'email'    => 'vendedor@example.com',
            'phone'    => '11999998888',
            'password' => 'segredo123',
            'role'     => 'vendedor',
        ];

        $this->actingAsUser($admin)
            ->postJson('/api/users', $payload)
            ->assertCreated()
            ->assertJsonPath('data.email', 'vendedor@example.com')
            ->assertJsonPath('data.role', 'vendedor');

        $this->assertDatabaseHas('users', [
            'email'            => 'vendedor@example.com',
            'establishment_id' => $establishment->id,
        ]);
    }

    public function test_store_validates_required_fields(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');

        $this->actingAsUser($admin)
            ->postJson('/api/users', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    public function test_cannot_create_with_duplicate_email(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');
        $existing = $this->createUser($establishment, 'vendedor');

        $this->actingAsUser($admin)
            ->postJson('/api/users', [
                'name'     => 'Outro',
                'email'    => $existing->email,
                'password' => 'segredo123',
                'role'     => 'vendedor',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_admin_can_update_user(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');
        $target = $this->createUser($establishment, 'vendedor');

        $this->actingAsUser($admin)
            ->putJson("/api/users/{$target->id}", [
                'name'      => 'Nome Editado',
                'email'     => $target->email,
                'role'      => 'gerente',
                'is_active' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nome Editado')
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.role', 'gerente');
    }

    public function test_cannot_update_user_from_other_establishment(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');

        $other = $this->createEstablishment();
        $target = $this->createUser($other, 'vendedor');

        $this->actingAsUser($admin)
            ->putJson("/api/users/{$target->id}", ['name' => 'Hack', 'email' => $target->email, 'role' => 'vendedor'])
            ->assertNotFound();
    }

    public function test_admin_can_soft_delete_user(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');
        $target = $this->createUser($establishment, 'vendedor');

        $this->actingAsUser($admin)
            ->deleteJson("/api/users/{$target->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('users', ['id' => $target->id]);
    }

    public function test_cannot_delete_self(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');

        $this->actingAsUser($admin)
            ->deleteJson("/api/users/{$admin->id}")
            ->assertForbidden();
    }

    public function test_admin_can_reset_password(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');
        $target = $this->createUser($establishment, 'vendedor');

        $response = $this->actingAsUser($admin)
            ->postJson("/api/users/{$target->id}/reset-password")
            ->assertOk();

        $temporary = $response->json('data.temporary_password');
        $this->assertNotEmpty($temporary);
        $this->assertEquals(12, strlen($temporary));

        $target->refresh();
        $this->assertTrue($target->must_change_password);
    }

    public function test_cannot_reset_own_password_via_admin_endpoint(): void
    {
        $establishment = $this->createEstablishment();
        $admin = $this->createUser($establishment, 'admin');

        $this->actingAsUser($admin)
            ->postJson("/api/users/{$admin->id}/reset-password")
            ->assertForbidden();
    }
}
