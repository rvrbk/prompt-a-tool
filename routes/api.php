<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Prompt generation endpoint
Route::post('/generate-prompts', [\App\Http\Controllers\PromptController::class, 'generatePrompts']);

// Mistral AI service status
Route::get('/mistral/status', [\App\Http\Controllers\PromptController::class, 'status']);

// Template endpoints
Route::prefix('templates')->group(function () {
    Route::get('/', [\App\Http\Controllers\TemplateController::class, 'index']);
    Route::get('/featured', [\App\Http\Controllers\TemplateController::class, 'featured']);
    Route::get('/categories', [\App\Http\Controllers\TemplateController::class, 'categories']);
    Route::get('/metadata', [\App\Http\Controllers\TemplateController::class, 'metadata']);
    Route::get('/{id}', [\App\Http\Controllers\TemplateController::class, 'show']);
    Route::get('/{id}/apply', [\App\Http\Controllers\TemplateController::class, 'apply']);
});
