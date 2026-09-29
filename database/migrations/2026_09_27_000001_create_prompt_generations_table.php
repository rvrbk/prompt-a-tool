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
        Schema::create('prompt_generations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('idea');
            $table->string('target_platform', 20);
            $table->string('language', 10)->nullable();
            $table->json('follow_up_answers')->nullable();
            // Generated roles, agents, backend_prompts and frontend_prompts
            $table->json('result');
            $table->timestamps();

            // Listing is always "this user's generations, newest first"
            $table->index(['user_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prompt_generations');
    }
};
