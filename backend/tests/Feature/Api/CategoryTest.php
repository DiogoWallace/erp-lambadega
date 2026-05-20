<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Establishment;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    // ─── Authentication ────────────────────────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/categories')->assertUnauthorized();
    }

    // ─── Authorization ─────────────────────────────────────────────────────────

    public function test_user_without_categories_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro');

        $this->actingAsUser($user)
            ->getJson('/api/categories')
            ->assertForbidden();
    }

    public function test_user_without_categories_create_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro');

        $this->actingAsUser($user)
            ->postJson('/api/categories', ['name' => 'Test'])
            ->assertForbidden();
    }

    public function test_user_without_categories_delete_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'financeiro');
        $category = Category::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/categories/{$category->id}")
            ->assertForbidden();
    }

    // ─── Index (paginated) ─────────────────────────────────────────────────────

    public function test_admin_can_list_categories(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Category::factory()->count(3)->create(['establishment_id' => $establishment->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/categories')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links']);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_is_scoped_to_own_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);

        Category::factory()->count(2)->create(['establishment_id' => $ours->id]);
        Category::factory()->count(4)->create(['establishment_id' => $theirs->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/categories')
            ->assertOk();

        $this->assertCount(2, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_search(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Category::factory()->create(['establishment_id' => $establishment->id, 'name' => 'Bebidas']);
        Category::factory()->create(['establishment_id' => $establishment->id, 'name' => 'Comidas']);

        $response = $this->actingAsUser($user)
            ->getJson('/api/categories?search=Bebidas')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Bebidas', $response->json('data.0.name'));
    }

    public function test_list_can_be_filtered_by_is_active(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Category::factory()->count(2)->create(['establishment_id' => $establishment->id, 'is_active' => true]);
        Category::factory()->count(3)->create(['establishment_id' => $establishment->id, 'is_active' => false]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/categories?is_active=0')
            ->assertOk();

        $this->assertCount(3, $response->json('data'));
    }

    // ─── Index (?all=1) ────────────────────────────────────────────────────────

    public function test_all_param_returns_non_paginated_list(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Category::factory()->count(5)->create(['establishment_id' => $establishment->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/categories?all=1')
            ->assertOk();

        $this->assertCount(5, $response->json('data'));
        $this->assertNull($response->json('meta'));
    }

    public function test_all_param_is_also_scoped_to_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);

        Category::factory()->count(3)->create(['establishment_id' => $ours->id]);
        Category::factory()->count(5)->create(['establishment_id' => $theirs->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/categories?all=1')
            ->assertOk();

        $this->assertCount(3, $response->json('data'));
    }

    // ─── Show ──────────────────────────────────────────────────────────────────

    public function test_admin_can_show_category(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $category = Category::factory()->create([
            'establishment_id' => $establishment->id,
            'name' => 'Bebidas',
        ]);

        $this->actingAsUser($user)
            ->getJson("/api/categories/{$category->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $category->id)
            ->assertJsonPath('data.name', 'Bebidas');
    }

    public function test_cannot_show_category_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $category = Category::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->getJson("/api/categories/{$category->id}")
            ->assertNotFound();
    }

    public function test_show_includes_parent_relation(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $parent = Category::factory()->create(['establishment_id' => $establishment->id, 'name' => 'Parent']);
        $child = Category::factory()->create([
            'establishment_id' => $establishment->id,
            'name' => 'Child',
            'parent_id' => $parent->id,
        ]);

        $this->actingAsUser($user)
            ->getJson("/api/categories/{$child->id}")
            ->assertOk()
            ->assertJsonPath('data.parent.id', $parent->id)
            ->assertJsonPath('data.parent.name', 'Parent');
    }

    // ─── Store ─────────────────────────────────────────────────────────────────

    public function test_admin_can_create_category(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/categories', [
                'name' => 'Nova Categoria',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Nova Categoria')
            ->assertJsonPath('data.establishment_id', $establishment->id);

        $this->assertDatabaseHas('categories', [
            'establishment_id' => $establishment->id,
            'name' => 'Nova Categoria',
        ]);
    }

    public function test_slug_is_auto_generated_from_name(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $response = $this->actingAsUser($user)
            ->postJson('/api/categories', ['name' => 'Bebidas Alcoólicas'])
            ->assertCreated();

        $this->assertEquals('bebidas-alcoolicas', $response->json('data.slug'));
    }

    public function test_store_validates_required_name(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/categories', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_store_validates_parent_belongs_to_same_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $foreignParent = Category::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->postJson('/api/categories', [
                'name' => 'Test',
                'parent_id' => $foreignParent->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['parent_id']);
    }

    // ─── Update ────────────────────────────────────────────────────────────────

    public function test_admin_can_update_category(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $category = Category::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->putJson("/api/categories/{$category->id}", ['name' => 'Atualizada'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Atualizada');

        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'Atualizada']);
    }

    public function test_category_cannot_be_its_own_parent(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $category = Category::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->putJson("/api/categories/{$category->id}", [
                'name' => $category->name,
                'parent_id' => $category->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_cannot_update_category_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $category = Category::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->putJson("/api/categories/{$category->id}", ['name' => 'Hacked'])
            ->assertNotFound();
    }

    // ─── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_can_soft_delete_category(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $category = Category::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/categories/{$category->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('categories', ['id' => $category->id]);
    }

    public function test_cannot_delete_category_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $category = Category::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/categories/{$category->id}")
            ->assertNotFound();
    }
}
