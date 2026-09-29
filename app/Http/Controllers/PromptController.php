<?php

namespace App\Http\Controllers;

use App\Models\PromptGeneration;
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
     * roles, agents, and prompts for the app idea.
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
            'targetPlatform' => 'required|string|in:web,ios,android,both',
            'language' => 'sometimes|string|max:10',
        ]);

        // Log the received data for debugging
        Log::info('Prompt generation request received', [
            'data' => $validated,
            'language' => $validated['language'] ?? 'en'
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
            $language = $validated['language'] ?? null;
            $mistralResponse = $this->mistralService->generatePrompts($validated, $language);

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

            // Save complete results to the signed-in user's account
            $saved = $this->saveForUser($request, $validated, $mistralResponse);
            if ($saved) {
                $response['saved_id'] = $saved->id;
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

    /**
     * Store a generation for the signed-in user
     *
     * Guests are skipped, and so are incomplete AI responses: the frontend
     * retries those, and only the final complete result should be kept.
     */
    protected function saveForUser(Request $request, array $validated, array $mistralResponse): ?PromptGeneration
    {
        $user = $request->user();
        if (! $user) {
            return null;
        }

        $result = array_filter(
            array_intersect_key($mistralResponse, array_flip(PromptGeneration::RESULT_KEYS)),
            fn ($section) => is_array($section) && count($section) > 0,
        );
        if ($result === []) {
            return null;
        }

        try {
            return $user->promptGenerations()->create([
                'idea' => $validated['idea'],
                'target_platform' => $validated['targetPlatform'],
                'language' => $validated['language'] ?? null,
                'follow_up_answers' => $validated['followUpAnswers'] ?? [],
                'result' => $result,
            ]);
        } catch (Exception $e) {
            // Saving is a bonus; never fail the generation because of it
            Log::error('Saving prompt generation failed', ['user_id' => $user->id, 'error' => $e->getMessage()]);

            return null;
        }
    }
}
