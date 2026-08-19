<?php

namespace App\Http\Controllers;

use App\Services\MistralService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Exception;

class PromptController extends Controller
{
    /**
     * The Mistral service instance
     */
    protected MistralService $mistralService;

    /**
     * Create a new controller instance
     */
    public function __construct(MistralService $mistralService)
    {
        $this->mistralService = $mistralService;
    }

    /**
     * Generate prompts based on questionnaire data
     *
     * This endpoint accepts questionnaire data and uses Mistral AI to generate
     * roles, agents, and prompts for the African-focused app idea.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generatePrompts(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'idea' => 'required|string|max:1000',
            'offlineAccess' => 'required|boolean',
        ]);

        // Log the received data for debugging
        Log::info('Prompt generation request received', [
            'data' => $validated
        ]);

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
            $mistralResponse = $this->mistralService->generatePrompts($validated);

            // Build the response
            $response = [
                'status' => 'success',
                'message' => 'Prompts generated successfully',
                'data' => $validated,
                'generated_at' => now()->toISOString(),
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

            return response()->json($response);

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
