<?php

use Illuminate\Support\Facades\Route;

// Main app page
Route::get('/', function () {
    return view('app');
})->name('app');

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'healthy']);
});

// Catch-all route for SPA - must be last
Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
