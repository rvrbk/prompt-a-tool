<?php

namespace App\Http\Controllers;

use App\Models\Session;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Controller for managing user sessions
 *
 * This controller provides endpoints for saving, loading, and listing
 * user sessions for the Africa Prompt Generator.
 */
class SessionController extends Controller
{
    /**
     * Save a user session
     *
     * Creates or updates a session with questionnaire data and generated results.
     * For authenticated users, associates with user_id. For anonymous users,
     * generates a unique session_id and tracks via cookies.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validate request data
        $validated = $request->validate([
            'questionnaire_data' => 'required|array',
            'questionnaire_data.idea' => 'required|string|max:1000',
            'questionnaire_data.countries' => 'required|array',
            'questionnaire_data.userTypes' => 'required|array',
            'questionnaire_data.offlineAccess' => 'required|boolean',
            'questionnaire_data.features' => 'nullable|array',
            'questionnaire_data.aiFeatures' => 'nullable|array',
            'generated_data' => 'nullable|array',
            'name' => 'nullable|string|max:255',
            'session_id' => 'nullable|string|max:255',
        ]);

        $userId = $request->user()?->id;
        $isAnonymous = $userId === null;

        try {
            // Generate or use provided session ID
            $sessionId = $validated['session_id'] ?? Session::generateSessionId();

            // Create or update session
            $session = Session::updateOrCreate(
                ['session_id' => $sessionId],
                [
                    'user_id' => $userId,
                    'name' => $validated['name'] ?? $this->generateSessionName($validated['questionnaire_data']),
                    'questionnaire_data' => $validated['questionnaire_data'],
                    'generated_data' => $validated['generated_data'] ?? null,
                    'is_anonymous' => $isAnonymous,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]
            );

            Log::info('Session saved', [
                'session_id' => $session->session_id,
                'user_id' => $userId,
                'is_anonymous' => $isAnonymous,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Session saved successfully',
                'data' => [
                    'session_id' => $session->session_id,
                    'name' => $session->name,
                    'created_at' => $session->created_at->toISOString(),
                    'updated_at' => $session->updated_at->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to save session', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to save session: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Load a specific session
     *
     * @param  string  $sessionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(string $sessionId): JsonResponse
    {
        $userId = request()->user()?->id;

        // Find session by session_id or by numeric ID
        $session = Session::where('session_id', $sessionId);
        
        // If session_id doesn't look like a UUID/timestamp, try numeric ID
        if (!preg_match('/^sess_/', $sessionId)) {
            $session = $session->orWhere('id', $sessionId);
        }
        
        $session = $session->first();

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session not found',
            ], 404);
        }

        // For authenticated users, ensure they own the session
        if ($userId && $session->user_id !== $userId && !$session->is_anonymous) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access to session',
            ], 403);
        }

        Log::info('Session loaded', [
            'session_id' => $session->session_id,
            'user_id' => $userId,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Session loaded successfully',
            'data' => [
                'session_id' => $session->session_id,
                'name' => $session->name,
                'questionnaire_data' => $session->questionnaire_data,
                'generated_data' => $session->generated_data,
                'is_anonymous' => $session->is_anonymous,
                'created_at' => $session->created_at->toISOString(),
                'updated_at' => $session->updated_at->toISOString(),
            ],
        ]);
    }

    /**
     * List user sessions
     *
     * Returns all sessions for the current user (or anonymous sessions).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()?->id;
        $sessionId = $request->query('session_id');

        try {
            $query = Session::recent();

            if ($userId) {
                // Authenticated user: get their sessions
                $query->where('user_id', $userId);
            } else {
                // Anonymous user: filter by session_id from query if provided
                // This allows users to access their sessions via shareable links
                if ($sessionId) {
                    $query->where('session_id', $sessionId);
                } else {
                    // Return empty for anonymous users without session_id
                    // This prevents listing all anonymous sessions
                    $query->where('session_id', 'nonexistent');
                }
            }

            $sessions = $query->get();

            Log::info('Sessions listed', [
                'user_id' => $userId,
                'count' => $sessions->count(),
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $sessions->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'session_id' => $session->session_id,
                        'name' => $session->name,
                        'is_anonymous' => $session->is_anonymous,
                        'created_at' => $session->created_at->toISOString(),
                        'updated_at' => $session->updated_at->toISOString(),
                        'questionnaire_data' => $session->questionnaire_data,
                        'has_generated_data' => $session->generated_data !== null,
                    ];
                }),
                'count' => $sessions->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to list sessions', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to list sessions: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a session
     *
     * @param  string  $sessionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(string $sessionId): JsonResponse
    {
        $userId = request()->user()?->id;

        // Find session by session_id or by numeric ID
        $session = Session::where('session_id', $sessionId);
        
        // If session_id doesn't look like a UUID/timestamp, try numeric ID
        if (!preg_match('/^sess_/', $sessionId)) {
            $session = $session->orWhere('id', $sessionId);
        }
        
        $session = $session->first();

        if (!$session) {
            return response()->json([
                'status' => 'error',
                'message' => 'Session not found',
            ], 404);
        }

        // For authenticated users, ensure they own the session
        if ($userId && $session->user_id !== $userId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized to delete this session',
            ], 403);
        }

        try {
            $session->delete();

            Log::info('Session deleted', [
                'session_id' => $session->session_id,
                'user_id' => $userId,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Session deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete session', [
                'error' => $e->getMessage(),
                'session_id' => $session->session_id,
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to delete session: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Generate a descriptive name for a session based on questionnaire data
     *
     * @param  array  $questionnaireData
     * @return string
     */
    protected function generateSessionName(array $questionnaireData): string
    {
        $idea = $questionnaireData['idea'] ?? 'Untitled';
        $countries = $questionnaireData['countries'] ?? [];

        // Use first 50 characters of the idea
        $name = Str::limit($idea, 50);

        // Append first country if available
        if (!empty($countries)) {
            $name .= ' - ' . $countries[0];
        }

        // Append timestamp
        $name .= ' - ' . now()->format('Y-m-d H:i');

        return $name;
    }
}
