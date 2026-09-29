<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Mockery;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    private function mockProviderUser(string $provider, array $attributes): void
    {
        $socialUser = (new SocialiteUser)->map(array_merge([
            'id' => '1001',
            'nickname' => 'janedev',
            'name' => 'Jane',
            'email' => 'jane@example.com',
            'avatar' => 'https://example.com/jane.png',
        ], $attributes));

        $driver = Mockery::mock();
        $driver->shouldReceive('user')->andReturn($socialUser);
        Socialite::shouldReceive('driver')->with($provider)->andReturn($driver);
    }

    public function test_github_redirect_goes_to_github(): void
    {
        config(['services.github.client_id' => 'client', 'services.github.redirect' => 'http://localhost/auth/github/callback']);

        $this->get('/auth/github/redirect')
            ->assertRedirectContains('https://github.com/login/oauth/authorize');
    }

    public function test_unknown_providers_are_not_routed(): void
    {
        $this->get('/auth/twitter/redirect')->assertOk()->assertViewIs('app');
    }

    public function test_github_callback_creates_and_signs_in_a_new_user(): void
    {
        $this->mockProviderUser('github', ['email' => 'Jane@Example.com']);

        $this->get('/auth/github/callback')->assertRedirect('/');

        $user = User::where('github_id', '1001')->first();
        $this->assertNotNull($user);
        $this->assertSame('jane@example.com', $user->email);
        $this->assertNotNull($user->email_verified_at);
        $this->assertAuthenticatedAs($user);
    }

    public function test_github_callback_links_an_existing_account_by_email(): void
    {
        $existing = User::create(['name' => 'Jane Doe', 'email' => 'jane@example.com', 'google_id' => '555']);
        $this->mockProviderUser('github', []);

        $this->get('/auth/github/callback')->assertRedirect('/');

        $existing->refresh();
        $this->assertSame('1001', $existing->github_id);
        $this->assertSame('555', $existing->google_id);
        $this->assertSame('Jane Doe', $existing->name);
        $this->assertSame(1, User::count());
        $this->assertAuthenticatedAs($existing);
    }

    public function test_github_callback_falls_back_to_nickname_when_name_is_missing(): void
    {
        $this->mockProviderUser('github', ['name' => null]);

        $this->get('/auth/github/callback');

        $this->assertSame('janedev', User::first()->name);
    }

    public function test_github_callback_without_email_is_rejected(): void
    {
        $this->mockProviderUser('github', ['email' => null]);

        $this->get('/auth/github/callback')->assertRedirect('/?auth=no_email');

        $this->assertGuest();
        $this->assertSame(0, User::count());
    }

    public function test_google_callback_still_works(): void
    {
        $this->mockProviderUser('google', []);

        $this->get('/auth/google/callback')->assertRedirect('/');

        $this->assertAuthenticatedAs(User::where('google_id', '1001')->first());
    }

    public function test_failed_callback_redirects_with_notice(): void
    {
        $driver = Mockery::mock();
        $driver->shouldReceive('user')->andThrow(new \RuntimeException('bad state'));
        Socialite::shouldReceive('driver')->with('github')->andReturn($driver);

        $this->get('/auth/github/callback')->assertRedirect('/?auth=failed');
        $this->assertGuest();
    }
}
