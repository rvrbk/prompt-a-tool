<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'mistral' => [
        'url' => env('MISTRAL_API_URL', 'https://api.mistral.ai/v1/chat/completions'),
        'model' => env('MISTRAL_MODEL', 'mistral-medium'),
    ],

    'mobile_money' => [
        'default_phone' => env('MOBILE_MONEY_PHONE_NUMBER', ''),
        'enabled_countries' => [
            'NG', 'GH', 'KE', 'TZ', 'UG', 'RW', 'CM', 'SN', 'CI', 'BF',
            'ML', 'NE', 'BJ', 'TG', 'GA', 'CG', 'CD', 'AO', 'MZ', 'ZM',
            'ZW', 'MW', 'LS', 'BW', 'NA', 'SW', 'SS', 'LR', 'SL', 'GN',
            'GW', 'MR', 'SH', 'KM', 'CV', 'ST', 'SC', 'DJ', 'ER', 'ET',
        ],
        'providers' => [
            'NG' => ['MTN', 'Glo', 'Airtel', '9Mobile'],
            'GH' => ['MTN', 'Vodafone', 'AirtelTigo'],
            'KE' => ['M-Pesa', 'Airtel Money', 'T-Kash'],
            'TZ' => ['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'HaloPesa'],
            'UG' => ['MTN Mobile Money', 'Airtel Money', 'AfraMobile Money'],
        ],
    ],

];
