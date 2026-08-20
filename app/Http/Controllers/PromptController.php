<?php

namespace App\Http\Controllers;

use App\Services\MistralService;
use App\Services\MobileMoneyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use Exception;

class PromptController extends Controller
{
    /**
     * The Mistral service instance
     */
    protected MistralService $mistralService;

    /**
     * The Mobile Money service instance
     */
    protected MobileMoneyService $mobileMoneyService;

    /**
     * Create a new controller instance
     */
    public function __construct(MistralService $mistralService, MobileMoneyService $mobileMoneyService)
    {
        $this->mistralService = $mistralService;
        $this->mobileMoneyService = $mobileMoneyService;
    }

    /**
     * Generate prompts based on questionnaire data
     *
     * This endpoint accepts questionnaire data and uses Mistral AI to generate
     * roles, agents, and prompts for the app idea.
     *
     * It also enforces the Mobile Money payment requirement:
     * - Visitors from African countries get 1 free generation
     * - After that, they need to make a Mobile Money payment
     * - Payment status is tracked via cookies
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generatePrompts(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'idea' => 'required|string|max:1000',
            'followUpAnswers' => 'nullable|array',
            'offlineAccess' => 'required|boolean',
            'language' => 'sometimes|string|max:10',
        ]);

        // Log the received data for debugging
        Log::info('Prompt generation request received', [
            'data' => $validated,
            'language' => $validated['language'] ?? 'en'
        ]);

        // Check payment status and free trial
        $trialStatus = $this->mobileMoneyService->checkFreeTrial($request);
        $countryCode = $this->mobileMoneyService->detectCountryFromIP($request);
        $isAfricanCountry = $countryCode && $this->mobileMoneyService->isAfricanCountry($countryCode);

        // If Mobile Money is configured, enforce payment requirement for African visitors
        if ($this->mobileMoneyService->isConfigured()) {
            if (!$trialStatus['has_free'] && $isAfricanCountry) {
                // User has no free generations left and is from an African country
                $providers = $this->mobileMoneyService->getProvidersForCountry($countryCode);
                $defaultPhone = $this->mobileMoneyService->getDefaultPhoneNumber();

                return response()->json([
                    'status' => 'payment_required',
                    'message' => 'Mobile Money payment required for more generations.',
                    'requires_payment' => true,
                    'country' => $countryCode,
                    'country_name' => $this->mobileMoneyService->getCountryName($countryCode),
                    'providers' => $providers,
                    'default_phone' => $defaultPhone,
                    'payment_instructions' => $this->mobileMoneyService->getPaymentInstructions(
                        $countryCode,
                        $providers,
                        $defaultPhone
                    ),
                ], 402);
            }
        }

        try {
            // Check if Mistral is configured
            if (!$this->mistralService->isConfigured()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Mistral AI is not configured. Please set MISTRAL_API_KEY in your .env file.',
                    'data' => $validated,
                ], 500);
            }

            // Call Mistral AI to generate prompts
            $language = $validated['language'] ?? null;
            $mistralResponse = $this->mistralService->generatePrompts($validated, $language);

            // Build the response
            $response = [
                'status' => 'success',
                'message' => 'Prompts generated successfully',
                'data' => $validated,
                'generated_at' => now()->toISOString(),
                'free_generations_remaining' => max(0, $trialStatus['remaining'] - 1),
                'free_generations_used' => $trialStatus['used'] + 1,
            ];

            // Add Mistral-generated content if available
            if (isset($mistralResponse['roles'])) {
                $response['roles'] = $mistralResponse['roles'];
            }
            if (isset($mistralResponse['agents'])) {
                $response['agents'] = $mistralResponse['agents'];
            }
            if (isset($mistralResponse['backend_prompts'])) {
                $response['backend_prompts'] = $mistralResponse['backend_prompts'];
            }
            if (isset($mistralResponse['frontend_prompts'])) {
                $response['frontend_prompts'] = $mistralResponse['frontend_prompts'];
            }
            if (isset($mistralResponse['raw_response'])) {
                $response['raw_response'] = $mistralResponse['raw_response'];
            }

            // Increment the free trial counter
            $newCookieValue = $this->mobileMoneyService->incrementFreeTrial($request, $countryCode);
            $cookie = Cookie::make(
                'prompt_generator_free_trial',
                $newCookieValue,
                60 * 24 * 30, // 30 days
                null,
                null,
                false,
                true // HttpOnly
            );

            return response()->json($response)->withCookie($cookie);

        } catch (Exception $e) {
            Log::error('Prompt generation failed', [
                'error' => $e->getMessage(),
                'data' => $validated,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate prompts: ' . $e->getMessage(),
                'data' => $validated,
            ], 500);
        }
    }

    /**
     * Get Mistral service status
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function status()
    {
        return response()->json([
            'configured' => $this->mistralService->isConfigured(),
            'model' => $this->mistralService->getModel(),
        ]);
    }
}
