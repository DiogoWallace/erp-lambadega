<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('establishment_id')->constrained()->cascadeOnDelete();
            $table->string('order_number');
            $table->foreignUuid('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->constrained()->restrictOnDelete();
            $table->decimal('subtotal_amount', 10, 2)->default(0);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->enum('discount_type', ['fixed', 'percentage'])->default('fixed');
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->enum('status', ['pending', 'paid', 'canceled'])->default('pending');
            $table->enum('payment_method', ['credit_card', 'debit_card', 'pix', 'cash', 'bank_transfer', 'other'])->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['establishment_id', 'order_number']);
            $table->index(['establishment_id', 'status']);
            $table->index(['establishment_id', 'customer_id']);
            $table->index(['establishment_id', 'user_id']);
            $table->index(['establishment_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
