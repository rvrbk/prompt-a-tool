<?php

namespace App\Http\Controllers;

use App\Services\MistralService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Playful helpers around the app idea: roast one, or get a random one
 */
class IdeaController extends Controller
{
    public function __construct(protected MistralService $mistralService)
    {
    }

    /**
     * Roast an app idea with a funny but useful critique
     */
    public function roast(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'idea' => 'required|string|max:1000',
            'language' => 'sometimes|string|max:10',
        ]);

        if (! $this->mistralService->isConfigured()) {
            return $this->notConfigured();
        }

        try {
            $roast = $this->mistralService->roastIdea($validated['idea'], $validated['language'] ?? null);
        } catch (Exception $e) {
            Log::error('Roasting an idea failed', ['error' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to roast the idea: ' . $e->getMessage()], 500);
        }

        return response()->json(['status' => 'success', 'roast' => $roast]);
    }

    /**
     * Come up with a random app idea
     */
    public function surprise(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'language' => 'sometimes|string|max:10',
        ]);

        if (! $this->mistralService->isConfigured()) {
            return $this->notConfigured();
        }

        try {
            $idea = $this->mistralService->surpriseIdea($validated['language'] ?? null);
        } catch (Exception $e) {
            Log::error('Generating a surprise idea failed', ['error' => $e->getMessage()]);

            return response()->json(['status' => 'error', 'message' => 'Failed to come up with an idea: ' . $e->getMessage()], 500);
        }

        return response()->json(['status' => 'success', 'idea' => $idea]);
    }

    protected function notConfigured(): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Mistral AI is not configured. Please set MISTRAL_API_KEY in your .env file.',
        ], 500);
    }
}
