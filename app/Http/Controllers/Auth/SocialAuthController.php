<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\RedirectResponse as SymfonyRedirectResponse;
use Throwable;

class SocialAuthController extends Controller
{
    /**
     * Supported Socialite providers and the users column holding their ID
     */
    public const PROVIDERS = [
        'google' => 'google_id',
        'github' => 'github_id',
    ];

    /**
     * Send the user to the provider's OAuth consent screen
     */
    public function redirect(string $provider): SymfonyRedirectResponse
    {
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Handle the OAuth callback from the provider
     *
     * Finds the user by provider ID, falls back to linking an existing account
     * with the same email, and otherwise creates a new account.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Throwable $e) {
            Log::warning('OAuth callback failed', ['provider' => $provider, 'error' => $e->getMessage()]);

            return redirect('/?auth=failed');
        }

        // GitHub users can hide their email; Socialite only returns a primary, verified one
        $email = Str::lower((string) $socialUser->getEmail());
        if ($email === '') {
            Log::warning('OAuth callback returned no email', ['provider' => $provider]);

            return redirect('/?auth=no_email');
        }

        $column = self::PROVIDERS[$provider];

        $user = User::where($column, $socialUser->getId())->first()
            ?? User::where('email', $email)->first()
            ?? new User(['email' => $email]);

        $user->fill([
            'name' => $user->name ?: ($socialUser->getName() ?: $socialUser->getNickname() ?: $email),
            $column => (string) $socialUser->getId(),
            'avatar' => $socialUser->getAvatar() ?: $user->avatar,
        ]);
        // The provider has verified this address
        $user->email_verified_at ??= now();
        $user->save();

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return redirect()->intended('/');
    }

    /**
     * Return the currently authenticated user (or null)
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()]);
    }

    /**
     * Log the user out and invalidate the session
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['status' => 'logged_out']);
    }
}
