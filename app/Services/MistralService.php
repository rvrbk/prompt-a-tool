<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

/**
 * Service class for interacting with Mistral AI API
 *
 * This service handles all communication with the Mistral AI API,
 * including prompt generation, response parsing, and error handling.
 */
class MistralService
{
    /**
     * The Mistral API endpoint
     */
    protected string $apiUrl;

    /**
     * The Mistral API key
     */
    protected string $apiKey;

    /**
     * The default model to use
     */
    protected string $model;

    /**
     * Create a new MistralService instance
     */
    public function __construct()
    {
        $this->apiUrl = config('services.mistral.url', env('MISTRAL_API_URL', 'https://api.mistral.ai/v1/chat/completions'));
        $this->apiKey = env('MISTRAL_API_KEY');
        $this->model = config('services.mistral.model', env('MISTRAL_MODEL', 'mistral-medium'));
    }

    /**
     * Generate prompts, roles, and agents based on questionnaire data
     *
     * @param array $data The questionnaire data
     * @return array Parsed response with roles, agents, and prompts
     * @throws Exception If the API request fails
     */
    public function generatePrompts(array $data): array
    {
        if (empty($this->apiKey)) {
            throw new Exception('Mistral API key is not configured. Please set MISTRAL_API_KEY in your .env file.');
        }

        $prompt = $this->buildPrompt($data);

        Log::info('Mistral API request', [
            'model' => $this->model,
            'prompt_length' => strlen($prompt)
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->withOptions([
                'timeout' => 60, // 60 seconds timeout
            ])->post($this->apiUrl, [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 4000,
            ]);

            if ($response->failed()) {
                Log::error('Mistral API request failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                throw new Exception('Mistral API request failed: ' . $response->status() . ' - ' . $response->body());
            }

            $responseData = $response->json();

            if (!isset($responseData['choices'][0]['message']['content'])) {
                Log::error('Mistral API invalid response format', [
                    'response' => $responseData,
                ]);

                throw new Exception('Invalid response format from Mistral API');
            }

            $content = $responseData['choices'][0]['message']['content'];

            // Try to parse as JSON first
            $parsed = $this->tryParseJson($content);

            if ($parsed !== null) {
                return $parsed;
            }

            // If not valid JSON, wrap it in a response
            return [
                'raw_response' => $content,
                'roles' => [],
                'agents' => [],
                'backend_prompts' => [],
                'frontend_prompts' => [],
            ];

        } catch (Exception $e) {
            Log::error('Mistral API exception', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Build the prompt for Mistral AI based on questionnaire data
     *
     * @param array $data The questionnaire data
     * @return string The formatted prompt
     */
    protected function buildPrompt(array $data): string
    {
        $offlineAccess = ($data['offlineAccess'] ?? false) ? 'Yes' : 'No';
        
        // Format follow-up answers for the prompt
        $followUpInfo = '';
        if (!empty($data['followUpAnswers']) && is_array($data['followUpAnswers'])) {
            $followUpInfo = "\n\n**Follow-up Answers:**\n";
            foreach ($data['followUpAnswers'] as $id => $answer) {
                $followUpInfo .= "- Q{$id}: " . (is_bool($answer) ? ($answer ? 'Yes' : 'No') : $answer) . "\n";
            }
        }

        return <<<PROMPT
Given the following African-focused app idea and context, generate a comprehensive response with:

1. A list of user roles (with permissions and actions) as JSON array
2. A list of AI agents (with skills, tools, and responsibilities) as JSON array  
3. Technical prompts for Laravel backend development as JSON array - ORGANIZED BY ITERATIONS
4. Technical prompts for Vue.js frontend development as JSON array - ORGANIZED BY ITERATIONS

IMPORTANT: Structure the backend_prompts and frontend_prompts as ITERATIVE DEVELOPMENT PLANS.
Each iteration should build upon the previous one, following a logical development progression.

For backend_prompts, structure as:
- Iteration 1: Project Setup (Laravel installation, basic structure)
- Iteration 2: Core Models & Migrations (Database schema, models)
- Iteration 3: API Endpoints (RESTful routes, controllers)
- Iteration 4: Authentication & Authorization (User auth, permissions)
- Iteration 5: Business Logic (Service classes, business rules)
- Iteration 6: Data Validation & Testing (Requests, tests)
- Iteration 7: Deployment & Optimization (Production setup, performance)

For frontend_prompts, structure as:
- Iteration 1: Project Setup (Vue.js, Vite, Tailwind)
- Iteration 2: Core Components (Main layout, routing)
- Iteration 3: UI Forms & Inputs (User input components)
- Iteration 4: API Integration (Axios, API calls)
- Iteration 5: State Management (Pinia/Vuex, reactivity)
- Iteration 6: Enhanced UX (Animations, transitions, accessibility)
- Iteration 7: Testing & Build (Unit tests, production build)

Format the FINAL output as a single JSON object with these exact keys:
- "roles": array of role objects with name, description, permissions, and actions
- "agents": array of agent objects with name, description, skills, and tools
- "backend_prompts": array of backend development prompts (each with "iteration", "title", "description", "tasks", "dependencies")
- "frontend_prompts": array of frontend development prompts (each with "iteration", "title", "description", "tasks", "dependencies")

DO NOT include any markdown, explanations, or text outside the JSON. Only return the JSON object.

**App Idea**: {$data['idea']}{$followUpInfo}
**Offline Access Required**: {$offlineAccess}

Remember: This is for an African context. Consider local languages, connectivity challenges, mobile-first approach, relevant African use cases, and iterative development that allows for gradual feature rollout.
PROMPT;
    }

    /**
     * Try to parse a string as JSON, handling potential issues
     *
     * @param string $content The content to parse
     * @return array|null The parsed array or null if parsing fails
     */
    protected function tryParseJson(string $content): ?array
    {
        // Clean up the content - remove markdown code blocks if present
        $content = trim($content);
        
        // Remove ```json and ``` markers
        $content = preg_replace('/^```json\s*/', '', $content);
        $content = preg_replace('/\s*```$/', '', $content);
        $content = trim($content);

        $decoded = json_decode($content, true);

        if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
            return $decoded;
        }

        return null;
    }

    /**
     * Check if the API key is configured
     *
     * @return bool
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Get the current model being used
     *
     * @return string
     */
    public function getModel(): string
    {
        return $this->model;
    }

    /**
     * Generate follow-up questions based on app idea
     *
     * @param string $idea The app idea description
     * @return array Array of follow-up questions
     * @throws \Exception If the API request fails
     */
    public function generateFollowUpQuestions(string $idea): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Mistral API key is not configured. Please set MISTRAL_API_KEY in your .env file.');
        }

        $prompt = $this->buildFollowUpQuestionsPrompt($idea);

        Log::info('Mistral API follow-up questions request', [
            'model' => $this->model,
            'prompt_length' => strlen($prompt)
        ]);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->withOptions([
                'timeout' => 30,
            ])->post($this->apiUrl, [
                'model' => $this->model,
                'messages' => [
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
            ]);

            if ($response->failed()) {
                Log::error('Mistral API follow-up questions request failed', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                throw new \Exception('Mistral API request failed: ' . $response->status() . ' - ' . $response->body());
            }

            $responseData = $response->json();

            if (!isset($responseData['choices'][0]['message']['content'])) {
                Log::error('Mistral API invalid follow-up questions response format', [
                    'response' => $responseData,
                ]);

                throw new \Exception('Invalid response format from Mistral API');
            }

            $content = $responseData['choices'][0]['message']['content'];

            // Try to parse as JSON first
            $parsed = $this->tryParseJson($content);

            if ($parsed !== null && isset($parsed['questions']) && is_array($parsed['questions'])) {
                return $parsed['questions'];
            }

            // If not valid JSON, return empty array
            return [];

        } catch (\Exception $e) {
            Log::error('Mistral API follow-up questions exception', [
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Build the prompt for generating follow-up questions
     *
     * @param string $idea The app idea
     * @return string The formatted prompt
     */
    protected function buildFollowUpQuestionsPrompt(string $idea): string
    {
        return <<<PROMPT
Analyze the following African-focused app idea and generate 3-5 relevant follow-up questions to better understand the requirements.

Each question should help clarify:
- The target users or context
- Key features or technical requirements
- Specific African considerations (languages, connectivity, local challenges)

Format the response as a JSON object with a single "questions" key containing an array of question objects.
Each question object must have:
- "id": unique identifier (number)
- "question": the question text
- "type": one of "multiple_choice", "text", or "boolean"
- If type is "multiple_choice", include "options": array of possible answers
- If type is "text", optionally include "placeholder": hint text

Do NOT include any markdown, explanations, or text outside the JSON. Only return the JSON object.

Example format:
{
  "questions": [
    {
      "id": 1,
      "question": "What is the primary target audience for this app?",
      "type": "multiple_choice",
      "options": ["Farmers", "Students", "Small Business Owners", "Healthcare Workers", "General Public"]
    },
    {
      "id": 2,
      "question": "Will this app require offline functionality?",
      "type": "boolean"
    },
    {
      "id": 3,
      "question": "Are there any specific local languages that need to be supported?",
      "type": "text",
      "placeholder": "e.g., Swahili, Hausa, Amharic"
    }
  ]
}

App Idea: {$idea}

Remember: This is for an African context. Consider local challenges, languages, connectivity, and mobile-first approach.
PROMPT;
    }

}
