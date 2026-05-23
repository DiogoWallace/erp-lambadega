<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('establishment_id')->constrained()->cascadeOnDelete();
            // user_id NULL = broadcast (visível para todos do estabelecimento)
            $table->foreignUuid('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('type', 40);
            $table->enum('severity', ['info', 'warning', 'critical'])->default('info');
            $table->string('title', 200);
            $table->text('body')->nullable();
            $table->string('action_url', 255)->nullable();
            $table->json('data')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['establishment_id', 'user_id', 'read_at']);
            $table->index(['establishment_id', 'created_at']);
            $table->index(['type', 'read_at']);
        });

        Schema::create('notification_reads', function (Blueprint $table) {
            $table->foreignUuid('notification_id')->constrained('notifications')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->useCurrent();

            $table->primary(['notification_id', 'user_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_reads');
        Schema::dropIfExists('notifications');
    }
};
