<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignUuid('establishment_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('phone', 20)->nullable()->after('email');
            $table->boolean('is_active')->default(true)->after('phone');
            $table->softDeletes();

            $table->index('establishment_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('establishment_id');
            $table->dropColumn(['phone', 'is_active']);
            $table->dropSoftDeletes();
        });
    }
};
