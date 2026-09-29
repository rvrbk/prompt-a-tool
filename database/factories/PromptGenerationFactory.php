<?php

namespace Database\Factories;

use App\Models\PromptGeneration;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PromptGeneration>
 */
class PromptGenerationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'idea' => fake()->sentence(12),
            'target_platform' => fake()->randomElement(['web', 'ios', 'android', 'both']),
            'language' => 'en',
            'follow_up_answers' => [],
            'result' => [
                'roles' => [['name' => 'Backend Developer', 'description' => fake()->sentence()]],
                'agents' => [['name' => 'API Agent', 'description' => fake()->sentence()]],
                'backend_prompts' => [['title' => 'Models', 'prompt' => fake()->paragraph()]],
                'frontend_prompts' => [['title' => 'Layout', 'prompt' => fake()->paragraph()]],
            ],
        ];
    }
}
