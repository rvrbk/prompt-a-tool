<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Prompt generation endpoint
// Runs with the web session so results can be saved for signed-in users
Route::post('/generate-prompts', [\App\Http\Controllers\PromptController::class, 'generatePrompts'])->middleware('web');

// Follow-up questions generation
Route::post('/generate-questions', [\App\Http\Controllers\QuestionController::class, 'generateQuestions']);

// Mistral AI service status
Route::get('/mistral/status', [\App\Http\Controllers\PromptController::class, 'status']);

// Saved prompt generations of the signed-in user (session auth)
Route::middleware(['web', 'auth'])->prefix('prompts')->name('prompts.')->group(function () {
    Route::get('/', [\App\Http\Controllers\PromptHistoryController::class, 'index'])->name('index');
    Route::get('/{id}', [\App\Http\Controllers\PromptHistoryController::class, 'show'])->whereNumber('id')->name('show');
    Route::delete('/{id}', [\App\Http\Controllers\PromptHistoryController::class, 'destroy'])->whereNumber('id')->name('destroy');
});
