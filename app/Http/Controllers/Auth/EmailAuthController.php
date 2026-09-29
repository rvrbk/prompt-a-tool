<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class EmailAuthController extends Controller
{
    /**
     * Create an account with email and password, then sign the user in
     */
    public function register(Request $request): JsonResponse
    {
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'email.unique' => 'An account with this email already exists. Try signing in instead.',
        ]);

        $user = User::create($validated);

        Auth::login($user, remember: true);
        $request->session()->regenerate();

        return response()->json(['user' => $user], 201);
    }

    /**
     * Sign in with email and password
     */
    public function login(Request $request): JsonResponse
    {
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, remember: true)) {
            // Accounts created through Google or GitHub have no password to check against
            $socialOnly = User::where('email', $credentials['email'])
                ->whereNull('password')
                ->first(['google_id', 'github_id']);

            $provider = match (true) {
                $socialOnly?->google_id !== null => 'Google',
                $socialOnly?->github_id !== null => 'GitHub',
                default => null,
            };

            throw ValidationException::withMessages([
                'email' => $provider
                    ? "This account uses {$provider} sign-in. Continue with {$provider} instead."
                    : 'These credentials do not match our records.',
            ]);
        }

        $request->session()->regenerate();

        return response()->json(['user' => $request->user()]);
    }
}
