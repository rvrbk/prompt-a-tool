<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            $table->string('share_token')->nullable()->unique()->after('session_id');
            $table->boolean('is_shared')->default(false)->after('share_token');
            $table->timestamp('shared_at')->nullable()->after('is_shared');
            
            // Add index for share_token for faster lookups
            $table->index('share_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_sessions', function (Blueprint $table) {
            $table->dropIndex(['share_token']);
            $table->dropColumn(['share_token', 'is_shared', 'shared_at']);
        });
    }
};
