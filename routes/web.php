<?php

use App\Http\Controllers\Auth\EmailAuthController;
use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

// Main app page
Route::get('/', function () {
    return view('app');
})->name('app');

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'healthy']);
});

// Authentication (Google or GitHub via Socialite, or email + password)
Route::prefix('auth')->group(function () {
    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect'])
        ->whereIn('provider', array_keys(SocialAuthController::PROVIDERS))
        ->name('auth.social.redirect');
    Route::get('/{provider}/callback', [SocialAuthController::class, 'callback'])
        ->whereIn('provider', array_keys(SocialAuthController::PROVIDERS))
        ->name('auth.social.callback');
    Route::middleware(['guest', 'throttle:10,1'])->group(function () {
        Route::post('/register', [EmailAuthController::class, 'register'])->name('auth.register');
        Route::post('/login', [EmailAuthController::class, 'login'])->name('auth.login');
    });
    Route::get('/user', [SocialAuthController::class, 'user'])->name('auth.user');
    Route::post('/logout', [SocialAuthController::class, 'logout'])->middleware('auth')->name('auth.logout');
});

// Catch-all route for SPA - must be last
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
