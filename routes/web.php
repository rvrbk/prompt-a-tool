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
