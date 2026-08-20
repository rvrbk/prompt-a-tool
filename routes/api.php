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

// Mobile Money Payment routes
Route::prefix('payments')->group(function () {
    Route::get('/status', [\App\Http\Controllers\PaymentController::class, 'checkPaymentStatus']);
    Route::post('/validate-phone', [\App\Http\Controllers\PaymentController::class, 'validatePhoneNumber']);
    Route::get('/providers', [\App\Http\Controllers\PaymentController::class, 'getProviders']);
    Route::get('/countries', [\App\Http\Controllers\PaymentController::class, 'getEnabledCountries']);
    Route::get('/config', [\App\Http\Controllers\PaymentController::class, 'getConfiguration']);
    
    // Country override for testing
    Route::post('/override-country', [\App\Http\Controllers\PaymentController::class, 'setCountryOverride']);
    Route::post('/clear-override', [\App\Http\Controllers\PaymentController::class, 'clearCountryOverride']);
    
    // Payment simulation (development only)
    Route::post('/simulate', [\App\Http\Controllers\PaymentController::class, 'simulatePayment']);
});


