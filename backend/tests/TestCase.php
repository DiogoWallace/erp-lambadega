<?php

namespace Tests;

use App\Models\Establishment;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Laravel\Sanctum\Sanctum;

abstract class TestCase extends BaseTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);
    }

    protected function createEstablishment(array $attrs = []): Establishment
    {
        return Establishment::factory()->create($attrs);
    }

    protected function createUser(Establishment $establishment, string $role = 'admin', array $attrs = []): User
    {
        $user = User::factory()->create(array_merge(['establishment_id' => $establishment->id], $attrs));
        if ($role !== '') {
            $user->assignRole($role);
        }
        return $user;
    }

    protected function actingAsUser(User $user): static
    {
        Sanctum::actingAs($user, ['*']);
        return $this;
    }
}
