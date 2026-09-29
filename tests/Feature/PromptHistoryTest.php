<?php

namespace Tests\Feature;

use App\Models\PromptGeneration;
use App\Models\User;
use App\Services\MistralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class PromptHistoryTest extends TestCase
{
    use RefreshDatabase;

    private array $payload = [
        'idea' => 'A savings group app',
        'followUpAnswers' => ['q1' => 'Mobile money'],
        'targetPlatform' => 'web',
        'language' => 'en',
    ];

    private function fakeMistral(array $response): void
    {
        $this->mock(MistralService::class, function (MockInterface $mock) use ($response) {
            $mock->shouldReceive('isConfigured')->andReturn(true);
            $mock->shouldReceive('generatePrompts')->andReturn($response);
        });
    }

    public function test_a_signed_in_users_generation_is_saved(): void
    {
        $user = User::factory()->create();
        $this->fakeMistral(['roles' => [['name' => 'Dev']], 'agents' => [], 'backend_prompts' => [['title' => 'API']]]);

        $response = $this->actingAs($user)->postJson('/api/generate-prompts', $this->payload)->assertOk();

        $generation = $user->promptGenerations()->sole();
        $response->assertJsonPath('saved_id', $generation->id);
        $this->assertSame('A savings group app', $generation->idea);
        $this->assertSame(['q1' => 'Mobile money'], $generation->follow_up_answers);
        // Empty sections are not stored
        $this->assertSame(['roles', 'backend_prompts'], array_keys($generation->result));
    }

    public function test_guest_generations_are_not_saved(): void
    {
        $this->fakeMistral(['roles' => [['name' => 'Dev']]]);

        $this->postJson('/api/generate-prompts', $this->payload)
            ->assertOk()
            ->assertJsonMissingPath('saved_id');

        $this->assertDatabaseCount('prompt_generations', 0);
    }

    public function test_incomplete_responses_are_not_saved(): void
    {
        $user = User::factory()->create();
        $this->fakeMistral(['raw_response' => '{"roles": [']);

        $this->actingAs($user)->postJson('/api/generate-prompts', $this->payload)->assertOk();

        $this->assertDatabaseCount('prompt_generations', 0);
    }

    public function test_the_list_only_shows_the_users_own_generations_newest_first(): void
    {
        $user = User::factory()->create();
        $older = PromptGeneration::factory()->for($user)->create(['created_at' => now()->subDay()]);
        $newer = PromptGeneration::factory()->for($user)->create();
        PromptGeneration::factory()->create(); // someone else's

        $this->actingAs($user)->getJson('/api/prompts')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $newer->id)
            ->assertJsonPath('data.1.id', $older->id)
            ->assertJsonPath('data.0.counts', ['roles' => 1, 'agents' => 1, 'prompts' => 2])
            ->assertJsonMissingPath('data.0.result');
    }

    public function test_a_user_can_view_their_generation_with_the_full_result(): void
    {
        $generation = PromptGeneration::factory()->create();

        $this->actingAs($generation->user)->getJson("/api/prompts/{$generation->id}")
            ->assertOk()
            ->assertJsonPath('data.result.roles.0.name', 'Backend Developer');
    }

    public function test_a_user_cannot_view_or_delete_someone_elses_generation(): void
    {
        $generation = PromptGeneration::factory()->create();
        $intruder = User::factory()->create();

        $this->actingAs($intruder)->getJson("/api/prompts/{$generation->id}")->assertNotFound();
        $this->actingAs($intruder)->deleteJson("/api/prompts/{$generation->id}")->assertNotFound();
        $this->assertModelExists($generation);
    }

    public function test_a_user_can_delete_their_generation(): void
    {
        $generation = PromptGeneration::factory()->create();

        $this->actingAs($generation->user)->deleteJson("/api/prompts/{$generation->id}")->assertNoContent();

        $this->assertModelMissing($generation);
    }

    public function test_guests_cannot_access_the_history(): void
    {
        $this->getJson('/api/prompts')->assertUnauthorized();
    }
}
