<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register_and_is_signed_in(): void
    {
        $this->postJson('/auth/register', [
            'name' => 'Jane',
            'email' => ' Jane@Example.com ',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ])->assertCreated()->assertJsonPath('user.email', 'jane@example.com');

        $user = User::where('email', 'jane@example.com')->first();
        $this->assertAuthenticatedAs($user);
        $this->assertNotSame('secret-password', $user->password);
    }

    public function test_registration_validates_input(): void
    {
        $this->postJson('/auth/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email', 'password']);

        $this->assertGuest();
    }

    public function test_registration_rejects_an_existing_email(): void
    {
        User::factory()->create(['email' => 'jane@example.com']);

        $this->postJson('/auth/register', [
            'name' => 'Jane',
            'email' => 'JANE@example.com',
            'password' => 'secret-password',
            'password_confirmation' => 'secret-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_a_user_can_sign_in_with_the_correct_password(): void
    {
        $user = User::factory()->create(['email' => 'jane@example.com', 'password' => 'secret-password']);

        $this->postJson('/auth/login', ['email' => 'Jane@example.com', 'password' => 'secret-password'])
            ->assertOk()
            ->assertJsonPath('user.id', $user->id);

        $this->assertAuthenticatedAs($user);
    }

    public function test_a_wrong_password_is_rejected(): void
    {
        User::factory()->create(['email' => 'jane@example.com', 'password' => 'secret-password']);

        $this->postJson('/auth/login', ['email' => 'jane@example.com', 'password' => 'wrong-password'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'These credentials do not match our records.');

        $this->assertGuest();
    }

    public function test_a_github_only_account_is_pointed_to_github(): void
    {
        User::create(['name' => 'Jane', 'email' => 'jane@example.com', 'github_id' => '456']);

        $this->postJson('/auth/login', ['email' => 'jane@example.com', 'password' => 'whatever'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'This account uses GitHub sign-in. Continue with GitHub instead.');
    }

    public function test_a_google_only_account_is_pointed_to_google(): void
    {
        User::create(['name' => 'Jane', 'email' => 'jane@example.com', 'google_id' => '123']);

        $this->postJson('/auth/login', ['email' => 'jane@example.com', 'password' => 'anything'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'This account uses Google sign-in. Continue with Google instead.');
    }

    public function test_the_current_user_endpoint_and_logout(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/auth/user')->assertJsonPath('user.id', $user->id);
        $this->postJson('/auth/logout')->assertOk();
        $this->assertGuest();
    }
}
