<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Prompt generation endpoint
Route::post('/generate-prompts', [\App\Http\Controllers\PromptController::class, 'generatePrompts']);

// Follow-up questions generation
Route::post('/generate-questions', [\App\Http\Controllers\QuestionController::class, 'generateQuestions']);

// Mistral AI service status
Route::get('/mistral/status', [\App\Http\Controllers\PromptController::class, 'status']);


