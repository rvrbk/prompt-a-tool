<?php

namespace App\Http\Middleware;

use App\Services\MobileMoneyService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware to detect African countries from IP address and set up Mobile Money context
 */
class DetectAfricanCountry
{
    /**
     * The Mobile Money service instance
     */
    protected MobileMoneyService $mobileMoneyService;

    /**
     * Create a new middleware instance
     */
    public function __construct(MobileMoneyService $mobileMoneyService)
    {
        $this->mobileMoneyService = $mobileMoneyService;
    }

    /**
     * Handle an incoming request
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $guard
     * @return mixed
     */
    public function handle(Request $request, Closure $next, ?string $guard = null): Response
    {
        // Detect country from IP
        $countryCode = $this->mobileMoneyService->detectCountryFromIP($request);

        // If country is detected and is African, add it to the request
        if ($countryCode && $this->mobileMoneyService->isAfricanCountry($countryCode)) {
            $request->attributes->add(['african_country' => $countryCode]);
            $request->attributes->add(['african_country_name' => $this->mobileMoneyService->getCountryName($countryCode)]);
        }

        // Add Mobile Money configuration status to request
        $request->attributes->add(['mobile_money_configured' => $this->mobileMoneyService->isConfigured()]);

        return $next($request);
    }
}
