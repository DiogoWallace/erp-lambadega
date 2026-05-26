<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_cost_history', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('product_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('stock_movement_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('cost_price', 10, 2);
            $table->enum('source', ['stock_in', 'product_update', 'quote']);
            $table->text('notes')->nullable();
            $table->timestamp('effective_at')->index();
            $table->timestamp('created_at')->useCurrent();
            // sem updated_at — log imutável

            $table->index(['establishment_id', 'product_id', 'effective_at'], 'pch_estab_product_effective_idx');
            $table->index(['establishment_id', 'supplier_id', 'effective_at'], 'pch_estab_supplier_effective_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_cost_history');
    }
};
