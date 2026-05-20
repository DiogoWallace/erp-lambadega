<?php

namespace Tests\Feature\Api;

use App\Models\Product;
use Tests\TestCase;

class StockMovementTest extends TestCase
{
    // ─── Authentication ────────────────────────────────────────────────────────

    public function test_unauthenticated_request_gets_401(): void
    {
        $this->getJson('/api/stock-movements')->assertUnauthorized();
    }

    // ─── Authorization ─────────────────────────────────────────────────────────

    public function test_user_without_stock_view_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, role: '');

        $this->actingAsUser($user)
            ->getJson('/api/stock-movements')
            ->assertForbidden();
    }

    public function test_user_without_stock_create_gets_403(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment, 'vendedor');
        $product = Product::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [
                'product_id' => $product->id,
                'type'       => 'in',
                'quantity'   => 10,
            ])
            ->assertForbidden();
    }

    // ─── Index ─────────────────────────────────────────────────────────────────

    public function test_admin_can_list_movements(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create(['establishment_id' => $establishment->id]);

        foreach (range(1, 3) as $_) {
            $this->actingAsUser($user)->postJson('/api/stock-movements', [
                'product_id' => $product->id,
                'type'       => 'in',
                'quantity'   => 5,
            ]);
        }

        $response = $this->actingAsUser($user)
            ->getJson('/api/stock-movements')
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'links']);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_list_is_scoped_to_own_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $ourUser = $this->createUser($ours);
        $theirUser = $this->createUser($theirs);

        $ourProduct = Product::factory()->create(['establishment_id' => $ours->id]);
        $theirProduct = Product::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($ourUser)->postJson('/api/stock-movements', [
            'product_id' => $ourProduct->id,
            'type'       => 'in',
            'quantity'   => 10,
        ]);

        $this->actingAsUser($theirUser)->postJson('/api/stock-movements', [
            'product_id' => $theirProduct->id,
            'type'       => 'in',
            'quantity'   => 10,
        ]);

        $response = $this->actingAsUser($ourUser)
            ->getJson('/api/stock-movements')
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_type(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'stock_quantity'   => 50,
        ]);

        $this->actingAsUser($user)->postJson('/api/stock-movements', [
            'product_id' => $product->id, 'type' => 'in', 'quantity' => 10,
        ]);
        $this->actingAsUser($user)->postJson('/api/stock-movements', [
            'product_id' => $product->id, 'type' => 'out', 'quantity' => 5,
        ]);
        $this->actingAsUser($user)->postJson('/api/stock-movements', [
            'product_id' => $product->id, 'type' => 'in', 'quantity' => 3,
        ]);

        $response = $this->actingAsUser($user)
            ->getJson('/api/stock-movements?type=in')
            ->assertOk();

        $this->assertCount(2, $response->json('data'));
    }

    public function test_list_can_be_filtered_by_product(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $p1 = Product::factory()->create(['establishment_id' => $establishment->id]);
        $p2 = Product::factory()->create(['establishment_id' => $establishment->id]);

        $this->actingAsUser($user)->postJson('/api/stock-movements', [
            'product_id' => $p1->id, 'type' => 'in', 'quantity' => 10,
        ]);
        $this->actingAsUser($user)->postJson('/api/stock-movements', [
            'product_id' => $p2->id, 'type' => 'in', 'quantity' => 10,
        ]);

        $response = $this->actingAsUser($user)
            ->getJson("/api/stock-movements?product_id={$p1->id}")
            ->assertOk();

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals($p1->id, $response->json('data.0.product_id'));
    }

    // ─── Store — in ────────────────────────────────────────────────────────────

    public function test_in_movement_increases_stock(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'stock_quantity'   => 10,
        ]);

        $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [
                'product_id' => $product->id,
                'type'       => 'in',
                'quantity'   => 5,
            ])
            ->assertCreated()
            ->assertJsonPath('data.stock_before', 10)
            ->assertJsonPath('data.stock_after', 15);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_quantity' => 15]);
    }

    // ─── Store — out ───────────────────────────────────────────────────────────

    public function test_out_movement_decreases_stock(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'stock_quantity'   => 20,
        ]);

        $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [
                'product_id' => $product->id,
                'type'       => 'out',
                'quantity'   => 8,
            ])
            ->assertCreated()
            ->assertJsonPath('data.stock_before', 20)
            ->assertJsonPath('data.stock_after', 12);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_quantity' => 12]);
    }

    public function test_out_movement_fails_when_insufficient_stock(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'stock_quantity'   => 3,
        ]);

        $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [
                'product_id' => $product->id,
                'type'       => 'out',
                'quantity'   => 10,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['quantity']);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_quantity' => 3]);
    }

    // ─── Store — adjustment ────────────────────────────────────────────────────

    public function test_adjustment_sets_absolute_stock(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'stock_quantity'   => 15,
        ]);

        $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [
                'product_id'  => $product->id,
                'type'        => 'adjustment',
                'quantity'    => 7,
                'description' => 'Contagem de inventário',
            ])
            ->assertCreated()
            ->assertJsonPath('data.stock_before', 15)
            ->assertJsonPath('data.stock_after', 7);

        $this->assertDatabaseHas('products', ['id' => $product->id, 'stock_quantity' => 7]);
    }

    public function test_adjustment_to_zero_is_valid(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create([
            'establishment_id' => $establishment->id,
            'stock_quantity'   => 5,
        ]);

        $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [
                'product_id' => $product->id,
                'type'       => 'adjustment',
                'quantity'   => 0,
            ])
            ->assertCreated()
            ->assertJsonPath('data.stock_after', 0);
    }

    // ─── Validation ────────────────────────────────────────────────────────────

    public function test_store_validates_required_fields(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);

        $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['product_id', 'type', 'quantity']);
    }

    public function test_cannot_record_movement_for_product_from_other_establishment(): void
    {
        $ours = $this->createEstablishment();
        $theirs = $this->createEstablishment();
        $user = $this->createUser($ours);
        $product = Product::factory()->create(['establishment_id' => $theirs->id]);

        $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [
                'product_id' => $product->id,
                'type'       => 'in',
                'quantity'   => 10,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['product_id']);
    }

    // ─── Show ──────────────────────────────────────────────────────────────────

    public function test_admin_can_show_movement(): void
    {
        $establishment = $this->createEstablishment();
        $user = $this->createUser($establishment);
        $product = Product::factory()->create(['establishment_id' => $establishment->id]);

        $created = $this->actingAsUser($user)
            ->postJson('/api/stock-movements', [
                'product_id' => $product->id,
                'type'       => 'in',
                'quantity'   => 5,
            ])
            ->assertCreated()
            ->json('data');

        $this->actingAsUser($user)
            ->getJson("/api/stock-movements/{$created['id']}")
            ->assertOk()
            ->assertJsonPath('data.id', $created['id']);
    }
}
