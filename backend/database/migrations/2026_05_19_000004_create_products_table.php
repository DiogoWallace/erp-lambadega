<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('establishment_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('brand')->nullable();
            $table->string('sku')->nullable();
            $table->string('barcode')->nullable();
            $table->enum('unit', ['un', 'kg', 'g', 'l', 'ml', 'cx'])->default('un');
            $table->decimal('cost_price', 10, 2)->default(0);
            $table->decimal('sale_price', 10, 2)->default(0);
            $table->integer('stock_quantity')->default(0);
            $table->integer('min_stock_quantity')->default(0);
            $table->string('image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['establishment_id', 'sku']);
            $table->unique(['establishment_id', 'barcode']);
            $table->index(['establishment_id', 'category_id']);
            $table->index(['establishment_id', 'supplier_id']);
            $table->index(['establishment_id', 'is_active']);
            $table->index('stock_quantity');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
