<?php

namespace Tests\Feature\Api;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Tests\TestCase;

class ProductTest extends TestCase
{
    // ─── Authentication ────────────────────────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/products')->assertUnauthorized();
    }

    // ─── Authorization ─────────────────────────────────────────────────────────

    public function test_user_without_products_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, role: '');

        $this->actingAsUser($user)
            ->getJson('/api/products')
            ->assertForbidden();
    }

    public function test_user_without_products_create_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'vendedor');

        $this->actingAsUser($user)
            ->postJson('/api/products', ['name' => 'Test Product'])
            ->assertForbidden();
    }

    public function test_user_without_products_delete_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'gerente');
        $product = Product::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/products/{$product->id}")
            ->assertForbidden();
    }

    // ─── Index ─────────────────────────────────────────────────────────────────

    public function test_admin_can_list_products(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Product::factory()->count(3)->create(['establishment_id' => $establishment->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/products')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links']);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_is_scoped_to_own_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);

        Product::factory()->count(2)->create(['establishment_id' => $ours->id]);
        Product::factory()->count(5)->create(['establishment_id' => $theirs->id]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/products')
            ->assertOk();

        $this->assertCount(2, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_search(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Product::factory()->create(['establishment_id' => $establishment->id, 'name' => 'Caneta Azul', 'sku' => null]);
        Product::factory()->create(['establishment_id' => $establishment->id, 'name' => 'Caderno', 'sku' => null]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/products?search=Caneta')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Caneta Azul', $response->json('data.0.name'));
    }

    public function test_list_can_be_filtered_by_is_active(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Product::factory()->count(2)->create(['establishment_id' => $establishment->id, 'is_active' => true, 'sku' => null]);
        Product::factory()->count(3)->create(['establishment_id' => $establishment->id, 'is_active' => false, 'sku' => null]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/products?is_active=0')
            ->assertOk();

        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_category(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $category = Category::factory()->create(['establishment_id' => $establishment->id]);

        Product::factory()->count(2)->create(['establishment_id' => $establishment->id, 'category_id' => $category->id, 'sku' => null]);
        Product::factory()->count(3)->create(['establishment_id' => $establishment->id, 'category_id' => null, 'sku' => null]);

        $response = $this->actingAsUser($user)
            ->getJson("/api/products?category_id={$category->id}")
            ->assertOk();

        $this->assertCount(2, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_low_stock(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        Product::factory()->create([
            'establishment_id'   => $establishment->id,
            'stock_quantity'     => 2,
            'min_stock_quantity' => 5,
            'sku'                => null,
        ]);
        Product::factory()->create([
            'establishment_id'   => $establishment->id,
            'stock_quantity'     => 20,
            'min_stock_quantity' => 5,
            'sku'                => null,
        ]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/products?low_stock=1')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
    }

    // ─── Show ──────────────────────────────────────────────────────────────────

    public function test_admin_can_show_product(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'name'             => 'Produto Teste',
        ]);

        $this->actingAsUser($user)
            ->getJson("/api/products/{$product->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $product->id)
            ->assertJsonPath('data.name', 'Produto Teste');
    }

    public function test_cannot_show_product_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $product = Product::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->getJson("/api/products/{$product->id}")
            ->assertNotFound();
    }

    // ─── Store ─────────────────────────────────────────────────────────────────

    public function test_admin_can_create_product(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/products', [
                'name'       => 'Novo Produto',
                'sale_price' => 29.90,
                'unit'       => 'un',
                'is_active'  => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Novo Produto')
            ->assertJsonPath('data.establishment_id', $establishment->id);

        $this->assertDatabaseHas('products', [
            'establishment_id' => $establishment->id,
            'name'             => 'Novo Produto',
        ]);
    }

    public function test_store_validates_required_name(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/products', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_store_validates_sku_unique_per_establishment(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        Product::factory()->create(['establishment_id' => $establishment->id, 'sku' => 'SKU-001']);

        $this->actingAsUser($user)
            ->postJson('/api/products', ['name' => 'Outro', 'sku' => 'SKU-001'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['sku']);
    }

    public function test_same_sku_allowed_in_different_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        Product::factory()->create(['establishment_id' => $theirs->id, 'sku' => 'SKU-001']);

        $this->actingAsUser($user)
            ->postJson('/api/products', ['name' => 'Meu Produto', 'sku' => 'SKU-001'])
            ->assertCreated();
    }

    public function test_store_rejects_category_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $category = Category::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->postJson('/api/products', ['name' => 'Test', 'category_id' => $category->id])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id']);
    }

    // ─── Update ────────────────────────────────────────────────────────────────

    public function test_admin_can_update_product(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->putJson("/api/products/{$product->id}", ['name' => 'Produto Atualizado'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Produto Atualizado');

        $this->assertDatabaseHas('products', ['id' => $product->id, 'name' => 'Produto Atualizado']);
    }

    public function test_cannot_update_product_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $product = Product::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->putJson("/api/products/{$product->id}", ['name' => 'Hacked'])
            ->assertNotFound();
    }

    // ─── Destroy ───────────────────────────────────────────────────────────────

    public function test_admin_can_soft_delete_product(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/products/{$product->id}")
            ->assertNoContent();

        $this->assertSoftDeleted('products', ['id' => $product->id]);
    }

    public function test_cannot_delete_product_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $product = Product::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->deleteJson("/api/products/{$product->id}")
            ->assertNotFound();
    }
}
