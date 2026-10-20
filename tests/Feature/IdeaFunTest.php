<?php

namespace Tests\Feature;

use App\Services\MistralService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class IdeaFunTest extends TestCase
{
    private function fakeMistral(string $content): void
    {
        config(['services.mistral.url' => 'https://mistral.test/chat']);
        putenv('MISTRAL_API_KEY=test-key');
        $_ENV['MISTRAL_API_KEY'] = 'test-key';

        Http::fake(['mistral.test/*' => Http::response([
            'choices' => [['message' => ['content' => $content]]],
        ])]);
    }

    protected function tearDown(): void
    {
        putenv('MISTRAL_API_KEY');
        unset($_ENV['MISTRAL_API_KEY']);

        parent::tearDown();
    }

    public function test_an_idea_can_be_roasted(): void
    {
        $this->fakeMistral(json_encode([
            'verdict' => 'Uber for ladders. Bold.',
            'risks' => ['Nobody returns ladders', 'Insurance', 'Seasonality'],
            'competitors' => ['Home Depot rentals'],
            'silver_lining' => 'Neighbours do love sharing.',
        ]));

        $this->postJson('/api/roast-idea', ['idea' => 'Uber for ladders', 'language' => 'fr'])
            ->assertOk()
            ->assertJsonPath('roast.verdict', 'Uber for ladders. Bold.')
            ->assertJsonCount(3, 'roast.risks');

        Http::assertSent(fn ($request) => str_contains($request['messages'][0]['content'], 'French'));
    }

    public function test_an_unparseable_roast_is_an_error(): void
    {
        $this->fakeMistral('not json at all');

        $this->postJson('/api/roast-idea', ['idea' => 'Uber for ladders'])
            ->assertStatus(500)
            ->assertJsonPath('status', 'error');
    }

    public function test_roasting_requires_an_idea(): void
    {
        $this->postJson('/api/roast-idea', [])->assertUnprocessable()->assertJsonValidationErrors('idea');
    }

    public function test_a_surprise_idea_is_returned(): void
    {
        $this->fakeMistral('```json{"idea": "A swap shop for garden tools."}```');

        $this->postJson('/api/surprise-idea', ['language' => 'sw'])
            ->assertOk()
            ->assertJsonPath('idea', 'A swap shop for garden tools.');

        Http::assertSent(fn ($request) => str_contains($request['messages'][0]['content'], 'Swahili'));
    }

    public function test_the_personality_shapes_the_generation_prompt(): void
    {
        $this->fakeMistral(json_encode(['roles' => [['name' => 'Admin']]]));

        $this->postJson('/api/generate-prompts', [
            'idea' => 'A savings group app',
            'targetPlatform' => 'web',
            'personality' => 'pirate',
        ])->assertOk();

        Http::assertSent(fn ($request) => str_contains($request['messages'][0]['content'], 'pirate captain'));
    }

    public function test_the_default_personality_adds_no_style_directive(): void
    {
        $this->fakeMistral(json_encode(['roles' => [['name' => 'Admin']]]));

        $this->postJson('/api/generate-prompts', [
            'idea' => 'A savings group app',
            'targetPlatform' => 'web',
            'personality' => 'default',
        ])->assertOk();

        Http::assertSent(fn ($request) => ! str_contains($request['messages'][0]['content'], 'Writing style'));
    }

    public function test_an_unknown_personality_is_rejected(): void
    {
        $this->postJson('/api/generate-prompts', [
            'idea' => 'A savings group app',
            'targetPlatform' => 'web',
            'personality' => 'villain',
        ])->assertUnprocessable()->assertJsonValidationErrors('personality');
    }
}
