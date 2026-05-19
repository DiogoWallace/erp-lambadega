<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sync_log', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('establishment_id')->constrained()->cascadeOnDelete();
            $table->string('table_name', 64);
            $table->uuid('record_id');
            $table->enum('operation', ['insert', 'update', 'delete']);
            $table->json('payload');
            $table->unsignedBigInteger('sequence');
            $table->enum('origin', ['central', 'local']);
            $table->string('origin_server_id', 64)->nullable();
            $table->timestamp('applied_at')->nullable();
            $table->timestamp('created_at');

            $table->index(['establishment_id', 'origin', 'sequence']);
            $table->index(['table_name', 'record_id']);
            $table->index('applied_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sync_log');
    }
};
