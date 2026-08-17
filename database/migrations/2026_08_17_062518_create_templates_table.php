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
        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category')->default('general');
            $table->string('icon')->nullable();
            $table->json('questionnaire_data')->nullable();
            $table->json('predefined_roles')->nullable();
            $table->json('predefined_agents')->nullable();
            $table->json('predefined_prompts')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('templates');
    }
};
