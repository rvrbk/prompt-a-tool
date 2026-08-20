<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Service class for handling Mobile Money payments for African countries
 *
 * This service provides:
 * - IP-based country detection
 * - Country to Mobile Money provider mapping
 * - Phone number validation
 * - Payment initiation
 * - Cookie-based session tracking for free generations
 */
class MobileMoneyService
{
    /**
     * Default phone number from environment
     */
    protected string $defaultPhoneNumber;

    /**
     * Enabled African countries (ISO 3166-1 alpha-2 codes)
     */
    protected array $enabledCountries;

    /**
     * Mobile Money providers by country
     */
    protected array $providers;

    /**
     * Cookie name for tracking free generations
     */
    protected string $cookieName = 'prompt_generator_free_trial';

    /**
     * Maximum free generations allowed per visitor
     */
    protected int $maxFreeGenerations = 1;

    /**
     * Create a new MobileMoneyService instance
     */
    public function __construct()
    {
        $this->defaultPhoneNumber = config('services.mobile_money.default_phone', '');
        $this->enabledCountries = config('services.mobile_money.enabled_countries', []);
        $this->providers = config('services.mobile_money.providers', []);
    }

    /**
     * Detect the visitor's country based on IP address
     *
     * @param  \Illuminate\Http\Request  $request
     * @return string|null ISO 3166-1 alpha-2 country code or null if not detected
     */
    public function detectCountryFromIP(Request $request): ?string
    {
        // For production, you would use a geo-IP service
        // For now, we'll check for common African IP ranges and use headers
        
        // Try to get country from Cloudflare or other proxy headers
        $country = $request->header('CF-IPCountry');
        
        if ($country && $this->isAfricanCountry($country)) {
            Log::info('Country detected from CF-IPCountry header', [
                'country' => $country,
                'ip' => $request->ip(),
            ]);
            return strtoupper($country);
        }

        // Try X-Forwarded-For or other headers
        $country = $request->header('HTTP_GEOIP_COUNTRY_CODE');
        if ($country && $this->isAfricanCountry($country)) {
            Log::info('Country detected from GEOIP header', [
                'country' => $country,
                'ip' => $request->ip(),
            ]);
            return strtoupper($country);
        }

        // For development/local testing, check if IP is in African ranges
        // This is a simplified approach - in production, use a proper geo-IP database
        $ip = $request->ip();
        
        // Common African IP ranges (simplified for demo purposes)
        // In production, use MaxMind GeoIP2 or similar service
        $africanRanges = [
            '197.' => 'NG',  // Nigeria
            '196.' => 'NG',  // Nigeria
            '105.' => 'ZA',  // South Africa
            '41.' => 'KE',   // Kenya
            '154.' => 'GH',  // Ghana
            '169.' => 'UG',  // Uganda
            '102.' => 'TZ',  // Tanzania
        ];

        foreach ($africanRanges as $prefix => $countryCode) {
            if (str_starts_with($ip, $prefix) && $this->isAfricanCountry($countryCode)) {
                Log::info('Country detected from IP prefix', [
                    'country' => $countryCode,
                    'ip' => $ip,
                ]);
                return $countryCode;
            }
        }

        // Default to null if not detected
        Log::info('Country not auto-detected from IP', [
            'ip' => $ip,
        ]);
        
        return null;
    }

    /**
     * Check if a country code is an enabled African country
     *
     * @param  string  $countryCode ISO 3166-1 alpha-2 country code
     * @return bool
     */
    public function isAfricanCountry(string $countryCode): bool
    {
        $countryCode = strtoupper($countryCode);
        return in_array($countryCode, $this->enabledCountries);
    }

    /**
     * Get Mobile Money providers for a specific country
     *
     * @param  string  $countryCode ISO 3166-1 alpha-2 country code
     * @return array Array of provider names
     */
    public function getProvidersForCountry(string $countryCode): array
    {
        $countryCode = strtoupper($countryCode);
        return $this->providers[$countryCode] ?? [];
    }

    /**
     * Get the default phone number for Mobile Money payments
     *
     * @return string
     */
    public function getDefaultPhoneNumber(): string
    {
        return $this->defaultPhoneNumber;
    }

    /**
     * Validate a phone number for Mobile Money payment
     *
     * @param  string  $phoneNumber Phone number to validate
     * @param  string  $countryCode ISO 3166-1 alpha-2 country code
     * @return array Validation result with 'valid' and 'message' keys
     */
    public function validatePhoneNumber(string $phoneNumber, string $countryCode): array
    {
        $phoneNumber = trim($phoneNumber);
        $countryCode = strtoupper($countryCode);

        // Remove any non-digit characters except leading +
        $cleaned = preg_replace('/[^\d+]/', '', $phoneNumber);

        // Check if country has Mobile Money support
        if (!$this->isAfricanCountry($countryCode)) {
            return [
                'valid' => false,
                'message' => 'Mobile Money is not available for this country.',
                'country_code' => $countryCode,
            ];
        }

        // Country-specific phone number validation
        $countryValidations = [
            'NG' => [
                'pattern' => '/^(\+234|0)[789]\d{9,10}$/',
                'example' => '+2348012345678 or 08012345678',
                'length' => [11, 14],
            ],
            'GH' => [
                'pattern' => '/^(\+233|0)[25]\d{9}$/',
                'example' => '+233241234567 or 0241234567',
                'length' => [10, 13],
            ],
            'KE' => [
                'pattern' => '/^(\+254|0)[71]\d{8,9}$/',
                'example' => '+254712345678 or 0712345678',
                'length' => [9, 12],
            ],
            'TZ' => [
                'pattern' => '/^(\+255|0)[67]\d{8,9}$/',
                'example' => '+255612345678 or 0612345678',
                'length' => [9, 12],
            ],
            'UG' => [
                'pattern' => '/^(\+256|0)[7]\d{8,9}$/',
                'example' => '+256712345678 or 0712345678',
                'length' => [9, 12],
            ],
            'RW' => [
                'pattern' => '/^(\+250|0)[7]\d{8,9}$/',
                'example' => '+250781234567 or 0781234567',
                'length' => [9, 12],
            ],
            // Generic validation for other African countries
            'default' => [
                'pattern' => '/^(\+\d{1,4}|0)\d{8,12}$/',
                'example' => '+256712345678',
                'length' => [8, 15],
            ],
        ];

        $validation = $countryValidations[$countryCode] ?? $countryValidations['default'];

        // Check length
        $cleanedDigits = preg_replace('/^\+/', '', $cleaned);
        $length = strlen($cleanedDigits);
        
        if (!preg_match($validation['pattern'], $cleaned)) {
            return [
                'valid' => false,
                'message' => "Invalid phone number format for {$countryCode}. Expected format: {$validation['example']}",
                'country_code' => $countryCode,
                'provided' => $phoneNumber,
            ];
        }

        return [
            'valid' => true,
            'message' => 'Phone number is valid.',
            'country_code' => $countryCode,
            'formatted_phone' => $cleaned,
            'providers' => $this->getProvidersForCountry($countryCode),
        ];
    }

    /**
     * Check if the visitor has remaining free generations
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array Result with 'has_free' and 'remaining' keys
     */
    public function checkFreeTrial(Request $request): array
    {
        $cookie = $request->cookie($this->cookieName);
        
        if (!$cookie) {
            // First time visitor - has free generation
            return [
                'has_free' => true,
                'remaining' => $this->maxFreeGenerations,
                'used' => 0,
            ];
        }

        // Parse cookie data (stored as JSON: {"used": X, "country": "XX", "ip": "..."})
        $cookieData = json_decode($cookie, true);
        
        if (!is_array($cookieData) || !isset($cookieData['used'])) {
            // Invalid cookie - treat as new visitor
            return [
                'has_free' => true,
                'remaining' => $this->maxFreeGenerations,
                'used' => 0,
            ];
        }

        $used = $cookieData['used'] ?? 0;
        $remaining = max(0, $this->maxFreeGenerations - $used);

        return [
            'has_free' => $remaining > 0,
            'remaining' => $remaining,
            'used' => $used,
            'cookie_data' => $cookieData,
        ];
    }

    /**
     * Increment the free trial usage and return updated cookie
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string|null  $countryCode Detected country code
     * @return string Updated cookie value (JSON encoded)
     */
    public function incrementFreeTrial(Request $request, ?string $countryCode = null): string
    {
        $cookie = $request->cookie($this->cookieName);
        $cookieData = [];

        if ($cookie) {
            $cookieData = json_decode($cookie, true);
        }

        $cookieData['used'] = ($cookieData['used'] ?? 0) + 1;
        $cookieData['country'] = $countryCode ?? $cookieData['country'] ?? null;
        $cookieData['ip'] = $request->ip();
        $cookieData['last_used'] = now()->toISOString();

        return json_encode($cookieData);
    }

    /**
     * Create a response for payment required
     *
     * @param  string  $countryCode Detected country code
     * @param  array  $providers Available Mobile Money providers
     * @param  string  $defaultPhone Default phone number from env
     * @return array Response data
     */
    public function getPaymentRequiredResponse(
        string $countryCode,
        array $providers,
        string $defaultPhone
    ): array {
        return [
            'requires_payment' => true,
            'country' => $countryCode,
            'country_name' => $this->getCountryName($countryCode),
            'providers' => $providers,
            'default_phone' => $defaultPhone,
            'payment_instructions' => $this->getPaymentInstructions($countryCode, $providers, $defaultPhone),
        ];
    }

    /**
     * Get country name from country code
     *
     * @param  string  $countryCode ISO 3166-1 alpha-2 country code
     * @return string Country name
     */
    public function getCountryName(string $countryCode): string
    {
        $countries = [
            'NG' => 'Nigeria',
            'GH' => 'Ghana',
            'KE' => 'Kenya',
            'TZ' => 'Tanzania',
            'UG' => 'Uganda',
            'RW' => 'Rwanda',
            'CM' => 'Cameroon',
            'SN' => 'Senegal',
            'CI' => "Cote d'Ivoire",
            'BF' => 'Burkina Faso',
            'ML' => 'Mali',
            'NE' => 'Niger',
            'BJ' => 'Benin',
            'TG' => 'Togo',
            'GA' => 'Gabon',
            'CG' => 'Republic of the Congo',
            'CD' => 'Democratic Republic of the Congo',
            'AO' => 'Angola',
            'MZ' => 'Mozambique',
            'ZM' => 'Zambia',
            'ZW' => 'Zimbabwe',
            'MW' => 'Malawi',
            'LS' => 'Lesotho',
            'BW' => 'Botswana',
            'NA' => 'Namibia',
            'SW' => 'Eswatini',
            'SS' => 'South Sudan',
            'LR' => 'Liberia',
            'SL' => 'Sierra Leone',
            'GN' => 'Guinea',
            'GW' => 'Guinea-Bissau',
            'MR' => 'Mauritania',
            'SH' => 'Saint Helena',
            'KM' => 'Comoros',
            'CV' => 'Cape Verde',
            'ST' => 'Sao Tome and Principe',
            'SC' => 'Seychelles',
            'DJ' => 'Djibouti',
            'ER' => 'Eritrea',
            'ET' => 'Ethiopia',
        ];

        return $countries[$countryCode] ?? $countryCode;
    }

    /**
     * Get payment instructions for a specific country
     *
     * @param  string  $countryCode ISO 3166-1 alpha-2 country code
     * @param  array  $providers Available Mobile Money providers
     * @param  string  $defaultPhone Default phone number
     * @return string Payment instructions
     */
    public function getPaymentInstructions(string $countryCode, array $providers, string $defaultPhone): string
    {
        $countryName = $this->getCountryName($countryCode);
        $providerList = implode(', ', $providers);

        if (empty($providers)) {
            return "Send Mobile Money payment to {$defaultPhone} to access more generations. Country: {$countryName}";
        }

        return "Send Mobile Money payment via {$providerList} to {$defaultPhone} to access more generations. Country: {$countryName}";
    }

    /**
     * Get all enabled African countries with their names
     *
     * @return array Array of country data (code, name, providers)
     */
    public function getAllEnabledCountries(): array
    {
        $countries = [];
        
        foreach ($this->enabledCountries as $code) {
            $countries[] = [
                'code' => $code,
                'name' => $this->getCountryName($code),
                'providers' => $this->getProvidersForCountry($code),
            ];
        }

        return $countries;
    }

    /**
     * Format phone number for display
     *
     * @param  string  $phoneNumber Phone number
     * @return string Formatted phone number
     */
    public function formatPhoneNumber(string $phoneNumber): string
    {
        $phoneNumber = trim($phoneNumber);
        
        // If it starts with 00, replace with +
        if (str_starts_with($phoneNumber, '00')) {
            $phoneNumber = '+' . substr($phoneNumber, 2);
        }

        // If it starts with 0 and doesn't have +, assume local and format
        if (str_starts_with($phoneNumber, '0') && !str_contains($phoneNumber, '+')) {
            // For demonstration, we'll keep it as is
            // In production, you'd need to know the country code to format properly
        }

        return $phoneNumber;
    }

    /**
     * Check if Mobile Money is configured (has default phone number)
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->defaultPhoneNumber);
    }
}
