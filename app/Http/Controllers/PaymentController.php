<?php

namespace App\Http\Controllers;

use App\Services\MobileMoneyService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;

/**
 * Controller for handling Mobile Money payments and free trial management
 */
class PaymentController extends Controller
{
    /**
     * The Mobile Money service instance
     */
    protected MobileMoneyService $mobileMoneyService;

    /**
     * Create a new controller instance
     */
    public function __construct(MobileMoneyService $mobileMoneyService)
    {
        $this->mobileMoneyService = $mobileMoneyService;
    }

    /**
     * Check if the visitor can generate prompts for free or needs payment
     *
     * This endpoint:
     * - Detects the visitor's country based on IP address
     * - Checks if they have remaining free generations via cookie
     * - Returns payment information if Mobile Money is configured
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function checkPaymentStatus(Request $request)
    {
        // Detect country from IP
        $countryCode = $this->mobileMoneyService->detectCountryFromIP($request);

        // Check if country is African
        $isAfricanCountry = $countryCode && $this->mobileMoneyService->isAfricanCountry($countryCode);

        // Get providers for the detected country
        $providers = $countryCode ? $this->mobileMoneyService->getProvidersForCountry($countryCode) : [];

        // Check free trial status
        $trialStatus = $this->mobileMoneyService->checkFreeTrial($request);

        // Get default phone number
        $defaultPhone = $this->mobileMoneyService->getDefaultPhoneNumber();

        // Build response
        $response = [
            'country_detected' => $countryCode !== null,
            'country' => $countryCode,
            'country_name' => $countryCode ? $this->mobileMoneyService->getCountryName($countryCode) : null,
            'is_african_country' => $isAfricanCountry,
            'has_free_generation' => $trialStatus['has_free'],
            'free_generations_remaining' => $trialStatus['remaining'],
            'free_generations_used' => $trialStatus['used'],
            'mobile_money_configured' => $this->mobileMoneyService->isConfigured(),
            'mobile_money_available' => $isAfricanCountry && $this->mobileMoneyService->isConfigured(),
            'providers' => $providers,
            'default_phone' => $defaultPhone,
            'requires_payment' => false,
            'payment_required_for_more' => false,
        ];

        // If Mobile Money is configured and user has no free generations left
        if ($this->mobileMoneyService->isConfigured()) {
            if (!$trialStatus['has_free'] && $isAfricanCountry) {
                $response['requires_payment'] = true;
                $response['payment_required_for_more'] = true;
                $response['payment_info'] = $this->mobileMoneyService->getPaymentRequiredResponse(
                    $countryCode,
                    $providers,
                    $defaultPhone
                );
            }
        }

        // If user has free generations, they can proceed
        if ($trialStatus['has_free']) {
            $response['can_generate'] = true;
            $response['message'] = 'You have free generations remaining.';
        } else {
            $response['can_generate'] = $isAfricanCountry && $this->mobileMoneyService->isConfigured();
            if ($isAfricanCountry && $this->mobileMoneyService->isConfigured()) {
                $response['message'] = 'Please make a Mobile Money payment to continue generating prompts.';
            } else {
                $response['message'] = 'Free trial limit reached. Mobile Money payment may be available for African countries.';
            }
        }

        Log::info('Payment status check', [
            'country' => $countryCode,
            'is_african' => $isAfricanCountry,
            'has_free' => $trialStatus['has_free'],
            'mobile_money_configured' => $this->mobileMoneyService->isConfigured(),
        ]);

        return response()->json($response);
    }

    /**
     * Validate a phone number for Mobile Money payment
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function validatePhoneNumber(Request $request)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string|max:20',
            'country_code' => 'required|string|size:2',
        ]);

        $validationResult = $this->mobileMoneyService->validatePhoneNumber(
            $validated['phone_number'],
            $validated['country_code']
        );

        if ($validationResult['valid']) {
            return response()->json([
                'status' => 'success',
                'message' => $validationResult['message'],
                'formatted_phone' => $validationResult['formatted_phone'],
                'country_code' => $validationResult['country_code'],
                'providers' => $validationResult['providers'],
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => $validationResult['message'],
            'country_code' => $validationResult['country_code'],
        ], 422);
    }

    /**
     * Get available Mobile Money providers for a country
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getProviders(Request $request)
    {
        $validated = $request->validate([
            'country_code' => 'required|string|size:2',
        ]);

        $countryCode = strtoupper($validated['country_code']);

        if (!$this->mobileMoneyService->isAfricanCountry($countryCode)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Country not supported for Mobile Money.',
                'country_code' => $countryCode,
                'providers' => [],
            ], 400);
        }

        $providers = $this->mobileMoneyService->getProvidersForCountry($countryCode);

        return response()->json([
            'status' => 'success',
            'country_code' => $countryCode,
            'country_name' => $this->mobileMoneyService->getCountryName($countryCode),
            'providers' => $providers,
        ]);
    }

    /**
     * Get all enabled African countries with Mobile Money support
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getEnabledCountries()
    {
        $countries = $this->mobileMoneyService->getAllEnabledCountries();

        return response()->json([
            'status' => 'success',
            'countries' => $countries,
            'total_count' => count($countries),
        ]);
    }

    /**
     * Manually set country for testing/development (with cookie)
     *
     * This allows overriding the IP-based detection for testing
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function setCountryOverride(Request $request)
    {
        $validated = $request->validate([
            'country_code' => 'required|string|size:2',
        ]);

        $countryCode = strtoupper($validated['country_code']);

        // Set cookie with country override
        $cookie = Cookie::make(
            'prompt_generator_country_override',
            $countryCode,
            60 * 24 * 30, // 30 days
            null,
            null,
            false,
            true // HttpOnly
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Country override set.',
            'country_code' => $countryCode,
            'country_name' => $this->mobileMoneyService->getCountryName($countryCode),
        ])->withCookie($cookie);
    }

    /**
     * Clear the country override cookie
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function clearCountryOverride()
    {
        $cookie = Cookie::forget('prompt_generator_country_override');

        return response()->json([
            'status' => 'success',
            'message' => 'Country override cleared.',
        ])->withCookie($cookie);
    }

    /**
     * Get the current payment configuration
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getConfiguration()
    {
        return response()->json([
            'mobile_money_configured' => $this->mobileMoneyService->isConfigured(),
            'default_phone' => $this->mobileMoneyService->getDefaultPhoneNumber(),
            'enabled_countries_count' => count($this->mobileMoneyService->getAllEnabledCountries()),
        ]);
    }

    /**
     * Simulate a payment (for testing purposes only)
     *
     * This endpoint resets the free trial counter, allowing the user to generate
     * more prompts. In a real implementation, this would be triggered after
     * a successful Mobile Money payment callback.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function simulatePayment(Request $request)
    {
        // This is for development/testing only
        if (app()->environment('production')) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment simulation is only available in non-production environments.',
            ], 403);
        }

        // Increment the trial counter (simulating payment receipt)
        $newCookieValue = $this->mobileMoneyService->incrementFreeTrial($request);

        // Actually, for simulation, we want to RESET the counter to allow more generations
        // So we'll create a fresh cookie
        $cookieData = [
            'used' => 0,
            'country' => null,
            'ip' => $request->ip(),
            'last_used' => now()->toISOString(),
        ];

        $cookie = Cookie::make(
            'prompt_generator_free_trial',
            json_encode($cookieData),
            60 * 24 * 30, // 30 days
            null,
            null,
            false,
            true // HttpOnly
        );

        Log::info('Payment simulation - reset free trial counter', [
            'ip' => $request->ip(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Payment simulated. You now have free generations available.',
            'has_free' => true,
            'remaining' => $this->mobileMoneyService->maxFreeGenerations,
        ])->withCookie($cookie);
    }

    /**
     * Get country from request (with override support)
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null
     */
    protected function getCountryFromRequest(Request $request): ?string
    {
        // Check for override cookie first
        if ($request->hasCookie('prompt_generator_country_override')) {
            $override = $request->cookie('prompt_generator_country_override');
            if ($this->mobileMoneyService->isAfricanCountry($override)) {
                return strtoupper($override);
            }
        }

        // Fall back to IP detection
        return $this->mobileMoneyService->detectCountryFromIP($request);
    }
}
