<?php

namespace App\Http\Controllers;

use App\Services\MistralService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class QuestionController extends Controller
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
     * Generate follow-up questions based on app idea
     *
     * This endpoint uses Mistral AI to generate relevant follow-up questions
     * based on the user's app idea description.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateQuestions(Request $request)
    {
        // Validate the request data
        $validated = $request->validate([
            'idea' => 'required|string|max:1000',
        ]);

        Log::info('Follow-up questions generation request received', [
            'idea' => $validated['idea']
        ]);

        try {
            // Check if Mistral is configured
            if (!$this->mistralService->isConfigured()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Mistral AI is not configured. Please set MISTRAL_API_KEY in your .env file.',
                    'questions' => [],
                ], 500);
            }

            // Generate questions using Mistral AI
            $questions = $this->mistralService->generateFollowUpQuestions($validated['idea']);

            return response()->json([
                'status' => 'success',
                'questions' => $questions,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to generate follow-up questions', [
                'error' => $e->getMessage(),
                'idea' => $validated['idea'],
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to generate questions: ' . $e->getMessage(),
                'questions' => [],
            ], 500);
        }
    }
}
