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
     * @param string|null $language The language code for prompt generation
     * @return array Parsed response with roles, agents, and prompts
     * @throws Exception If the API request fails
     */
    public function generatePrompts(array $data, ?string $language = null): array
    {
        if (empty($this->apiKey)) {
            throw new Exception('Mistral API key is not configured. Please set MISTRAL_API_KEY in your .env file.');
        }

        $prompt = $this->buildPrompt($data, $language);

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

            // If not valid JSON, try to extract JSON from the content
            // Sometimes the AI wraps JSON in markdown code blocks or adds explanations
            $extractedJson = $this->extractJsonFromContent($content);
            if ($extractedJson !== null) {
                $parsed = $this->tryParseJson($extractedJson);
                if ($parsed !== null) {
                    return $parsed;
                }
            }

            // If still not valid JSON, this is an error - return empty arrays
            // The frontend should handle this by showing a loading state or retrying
            return [
                'raw_response' => $content,
                'roles' => [],
                'agents' => [],
                'backend_prompts' => [],
                'frontend_prompts' => [],
                'status' => 'incomplete',
                'message' => 'AI response could not be parsed as JSON. Please try again.'
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
     * @param string|null $language The language code for prompt generation
     * @return string The formatted prompt
     */
    protected function buildPrompt(array $data, ?string $language = null): string
    {
        $targetPlatform = $this->getPlatformLabel($data['targetPlatform'] ?? 'web');
        $pwaInfo = ($data['targetPlatform'] ?? 'web') === 'web' ? 'Yes (PWA enabled)' : 'No';
        
        // Format follow-up answers for the prompt
        $followUpInfo = '';
        if (!empty($data['followUpAnswers']) && is_array($data['followUpAnswers'])) {
            if ($language === 'fr') {
                $followUpInfo = "\n\n**Réponses de suivi:**\n";
                foreach ($data['followUpAnswers'] as $id => $answer) {
                    $answerText = is_bool($answer) ? ($answer ? 'Oui' : 'Non') : $answer;
                    $followUpInfo .= "- Q{$id}: {$answerText}\n";
                }
            } else {
                $followUpInfo = "\n\n**Follow-up Answers:**\n";
                foreach ($data['followUpAnswers'] as $id => $answer) {
                    $answerText = is_bool($answer) ? ($answer ? 'Yes' : 'No') : $answer;
                    $followUpInfo .= "- Q{$id}: {$answerText}\n";
                }
            }
        }

        if ($language && $language !== 'en') {
            return $this->buildLocalizedPrompt($data, $language, $followUpInfo);
        }

        return <<<PROMPT
Given the following app idea and context, generate a comprehensive response with:

1. A list of user roles (with permissions and actions) as JSON array
2. A list of AI agents (with skills, tools, and responsibilities) as JSON array  
3. Technical prompts for backend development as JSON array - ORGANIZED BY ITERATIONS
4. Technical prompts for frontend development as JSON array - ORGANIZED BY ITERATIONS

IMPORTANT: Structure the backend_prompts and frontend_prompts as ITERATIVE DEVELOPMENT PLANS.
Each iteration should build upon the previous one, following a logical development progression.

IMPORTANT PLATFORM CONSIDERATION: The target platform is **{$targetPlatform}**. PWA support: **{$pwaInfo}**.
Adapt all technical prompts accordingly:
- For Web: Use Laravel backend + Vue.js frontend with PWA support (service workers, manifest, offline caching)
- For iOS: Use Swift/SwiftUI for frontend, suggest appropriate backend (Node.js, Laravel, or Firebase)
- For Android: Use Kotlin/Java for frontend, suggest appropriate backend
- For Both (iOS & Android): Suggest cross-platform solutions like Flutter or React Native, with appropriate backend

For backend_prompts, structure as:
- Iteration 1: Project Setup
- Iteration 2: Core Models & Migrations
- Iteration 3: API Endpoints
- Iteration 4: Authentication & Authorization
- Iteration 5: Business Logic
- Iteration 6: Data Validation & Testing
- Iteration 7: Deployment & Optimization

For frontend_prompts, structure as:
- Iteration 1: Project Setup
- Iteration 2: Core Components
- Iteration 3: UI Forms & Inputs
- Iteration 4: API Integration
- Iteration 5: State Management
- Iteration 6: Enhanced UX
- Iteration 7: Testing & Build

Format the FINAL output as a single JSON object with these exact keys:
- "roles": array of role objects with name, description, permissions, and actions
- "agents": array of agent objects with name, description, skills, and tools
- "backend_prompts": array of backend development prompts (each with "iteration", "title", "description", "tasks", "dependencies")
- "frontend_prompts": array of frontend development prompts (each with "iteration", "title", "description", "tasks", "dependencies")

DO NOT include any markdown, explanations, or text outside the JSON. Only return the JSON object.

**App Idea**: {$data['idea']}{$followUpInfo}
**Target Platform**: {$targetPlatform}
**PWA Support**: {$pwaInfo}
PROMPT;
    }

    /**
     * Build a localized prompt in the specified language
     *
     * @param array $data The questionnaire data
     * @param string $language The language code
     * @param string $followUpInfo Follow-up answers text
     * @return string The localized prompt
     */
    protected function buildLocalizedPrompt(array $data, string $language, string $followUpInfo): string
    {
        $languageName = $this->getLanguageName($language);
        $targetPlatform = $this->getPlatformLabel($data['targetPlatform'] ?? 'web');
        $pwaInfo = ($data['targetPlatform'] ?? 'web') === 'web' ? 'Yes (PWA enabled)' : 'No';
        
        // Get localized prompt parts
        $localized = $this->getLocalizedPromptParts($language);

        return <<<PROMPT
{$localized['instruction']}

CRITICAL INSTRUCTION: ALL output must be in {$languageName} language. This includes:
- Role names, descriptions
- Permission names (must be {$languageName} words, not English)
- Action names (must be {$languageName} words, not English)
- Agent names, descriptions, skills, tools, responsibilities
- ALL prompt text (titles, descriptions, tasks, dependencies)
- Use ONLY {$languageName} vocabulary throughout

1. {$localized['roles_desc']}
2. {$localized['agents_desc']}
3. {$localized['backend_prompts_desc']}
4. {$localized['frontend_prompts_desc']}

IMPORTANT: {$localized['iteration_structure']}
{$localized['iteration_explanation']}

IMPORTANT PLATFORM CONSIDERATION: The target platform is **{$targetPlatform}**. PWA support: **{$pwaInfo}**.
Adapt all technical prompts accordingly:
- For Web: Use Laravel backend + Vue.js frontend with PWA support (service workers, manifest, offline caching)
- For iOS: Use Swift/SwiftUI for frontend, suggest appropriate backend (Node.js, Laravel, or Firebase)
- For Android: Use Kotlin/Java for frontend, suggest appropriate backend
- For Both (iOS & Android): Suggest cross-platform solutions like Flutter or React Native, with appropriate backend

{$localized['backend_structure']}

{$localized['frontend_structure']}

{$localized['format_instruction']}
- "roles": {$localized['roles_format']}
- "agents": {$localized['agents_format']}
- "backend_prompts": {$localized['backend_prompts_format']}
- "frontend_prompts": {$localized['frontend_prompts_format']}

DO NOT include any markdown, explanations, or text outside the JSON. Only return the JSON object.

REMEMBER: ALL content MUST be in {$languageName} language. NO English words allowed in the output.

**App Idea**: {$data['idea']}{$followUpInfo}
**Target Platform**: {$targetPlatform}
**PWA Support**: {$pwaInfo}
PROMPT;
    }

    /**
     * Get localized prompt parts for a specific language
     *
     * @param string $language The language code
     * @return array Localized prompt parts
     */
    protected function getLocalizedPromptParts(string $language): array
    {
        $prompts = [
            'fr' => [
                'instruction' => 'Étant donné l\'idée de l\'application et le contexte suivant, générez une réponse complète avec:',
                'roles_desc' => 'Une liste de rôles utilisateur (avec permissions et actions) sous forme de tableau JSON',
                'agents_desc' => 'Une liste d\'agents IA (avec compétences, outils et responsabilités) sous forme de tableau JSON',
                'backend_prompts_desc' => 'Des prompts techniques pour le développement backend Laravel sous forme de tableau JSON - ORGANISÉS PAR ITÉRATIONS',
                'frontend_prompts_desc' => 'Des prompts techniques pour le développement frontend Vue.js sous forme de tableau JSON - ORGANISÉS PAR ITÉRATIONS',
                'iteration_structure' => 'IMPORTANT: Structurez les backend_prompts et frontend_prompts comme des PLANS DE DÉVELOPPEMENT ITÉRATIFS.',
                'iteration_explanation' => 'Chaque itération doit s\'appuyer sur la précédente, en suivant une progression logique de développement.',
                'backend_structure' => 'Pour backend_prompts, structurez comme:\n- Itération 1: Configuration initiale du projet (installation de Laravel, structure de base)\n- Itération 2: Modèles et Migrations de base de données (schéma, modèles)\n- Itération 3: Points de terminaison API (routes, contrôleurs)\n- Itération 4: Authentification et Autorisation (auth utilisateur, permissions)\n- Itération 5: Logique métier (classes de service, règles métier)\n- Itération 6: Validation des données et Tests (requêtes, tests)\n- Itération 7: Déploiement et Optimisation (configuration production, performance)',
                'frontend_structure' => 'Pour frontend_prompts, structurez comme:\n- Itération 1: Configuration initiale du projet (Vue.js, Vite, Tailwind)\n- Itération 2: Composants principaux (layout, routage)\n- Itération 3: Formulaires et Entrées utilisateur (composants d\'entrée)\n- Itération 4: Intégration API (Axios, appels API)\n- Itération 5: Gestion d\'état (Pinia/Vuex, réactivité)\n- Itération 6: UX Améliorée (animations, transitions, accessibilité)\n- Itération 7: Tests et Build (tests, build de production)',
                'format_instruction' => 'Formatez la sortie FINALE sous forme d\'un seul objet JSON avec ces clés exactes:',
                'roles_format' => 'tableau d\'objets rôle avec name, description, permissions, et actions',
                'agents_format' => 'tableau d\'objets agent avec name, description, skills, et tools',
                'backend_prompts_format' => 'tableau de prompts de développement backend (chacun avec "iteration", "title", "description", "tasks", "dependencies")',
                'frontend_prompts_format' => 'tableau de prompts de développement frontend (chacun avec "iteration", "title", "description", "tasks", "dependencies")',
            ],
            // Add other languages as needed
        ];

        return $prompts[$language] ?? [
            'instruction' => 'Given the following app idea and context, generate a comprehensive response with:',
            'roles_desc' => 'A list of user roles (with permissions and actions) as JSON array',
            'agents_desc' => 'A list of AI agents (with skills, tools, and responsibilities) as JSON array',
            'backend_prompts_desc' => 'Technical prompts for Laravel backend development as JSON array - ORGANIZED BY ITERATIONS',
            'frontend_prompts_desc' => 'Technical prompts for Vue.js frontend development as JSON array - ORGANIZED BY ITERATIONS',
            'iteration_structure' => 'IMPORTANT: Structure the backend_prompts and frontend_prompts as ITERATIVE DEVELOPMENT PLANS.',
            'iteration_explanation' => 'Each iteration should build upon the previous one, following a logical development progression.',
            'backend_structure' => 'For backend_prompts, structure as:\n- Iteration 1: Project Setup\n- Iteration 2: Core Models & Migrations\n- Iteration 3: API Endpoints\n- Iteration 4: Authentication & Authorization\n- Iteration 5: Business Logic\n- Iteration 6: Data Validation & Testing\n- Iteration 7: Deployment & Optimization',
            'frontend_structure' => 'For frontend_prompts, structure as:\n- Iteration 1: Project Setup\n- Iteration 2: Core Components\n- Iteration 3: UI Forms & Inputs\n- Iteration 4: API Integration\n- Iteration 5: State Management\n- Iteration 6: Enhanced UX\n- Iteration 7: Testing & Build',
            'format_instruction' => 'Format the FINAL output as a single JSON object with these exact keys:',
            'roles_format' => 'array of role objects with name, description, permissions, and actions',
            'agents_format' => 'array of agent objects with name, description, skills, and tools',
            'backend_prompts_format' => 'array of backend development prompts (each with "iteration", "title", "description", "tasks", "dependencies")',
            'frontend_prompts_format' => 'array of frontend development prompts (each with "iteration", "title", "description", "tasks", "dependencies")',
        ];
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
     * Try to extract JSON from content that might contain markdown or other formatting
     *
     * @param string $content The content to extract JSON from
     * @return string|null The extracted JSON string or null if not found
     */
    protected function extractJsonFromContent(string $content): ?string
    {
        // Look for content between ```json and ``` markers
        if (preg_match('/```json(.*?)```/s', $content, $matches)) {
            return trim($matches[1]);
        }
        
        // Look for content between ``` and ``` markers (might be just ```)
        if (preg_match('/```(.*?)```/s', $content, $matches)) {
            return trim($matches[1]);
        }
        
        // Look for JSON object starting with {
        if (preg_match('/\{(.*?)\}/s', $content, $matches)) {
            $potentialJson = '{' . $matches[1] . '}';
            // Quick validation - check if it starts and ends with braces
            if (str_starts_with($potentialJson, '{') && str_ends_with($potentialJson, '}')) {
                return $potentialJson;
            }
        }
        
        // Look for JSON object starting with [
        if (preg_match('/\[(.*?)\]/s', $content, $matches)) {
            $potentialJson = '[' . $matches[1] . ']';
            if (str_starts_with($potentialJson, '[') && str_ends_with($potentialJson, ']')) {
                return $potentialJson;
            }
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
     * @param string|null $language The language code for question generation (e.g., 'en', 'fr', 'es')
     * @return array Array of follow-up questions
     * @throws \Exception If the API request fails
     */
    public function generateFollowUpQuestions(string $idea, ?string $language = null): array
    {
        if (empty($this->apiKey)) {
            throw new \Exception('Mistral API key is not configured. Please set MISTRAL_API_KEY in your .env file.');
        }

        $prompt = $this->buildFollowUpQuestionsPrompt($idea, $language);

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
     * @param string|null $language The language code for question generation
     * @return string The formatted prompt
     */
    protected function buildFollowUpQuestionsPrompt(string $idea, ?string $language = null): string
    {
        if ($language && $language !== 'en') {
            return $this->buildLocalizedFollowUpPrompt($idea, $language);
        }

        return <<<PROMPT
Analyze the following app idea and generate 3-5 relevant follow-up questions to better understand the requirements.

IMPORTANT: DO NOT ask about target platform (Web, iOS, Android, mobile, etc.) or technology stack (Laravel, Vue.js, React, Flutter, etc.) - these have already been determined.

Each question should help clarify:
- The target users or context
- Key features or functional requirements (NOT technical platform)

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
      "options": ["Students", "Small Business Owners", "Healthcare Workers", "General Public"]
    },
    {
      "id": 2,
      "question": "Will this app require user authentication?",
      "type": "boolean"
    },
    {
      "id": 3,
      "question": "Are there any specific feature requirements?",
      "type": "text",
      "placeholder": "e.g., real-time updates, file uploads, search functionality"
    }
  ]
}

App Idea: {$idea}
PROMPT;
    }

    /**
     * Build a localized follow-up questions prompt in the specified language
     *
     * @param string $idea The app idea
     * @param string $language The language code
     * @return string The localized prompt
     */
    protected function buildLocalizedFollowUpPrompt(string $idea, string $language): string
    {
        $languageName = $this->getLanguageName($language);

        return <<<PROMPT
Analysez l'idée d'application suivante et générez 3 à 5 questions de suivi pertinentes pour mieux comprendre les exigences.

CRITICAL: ALL questions and options MUST be in {$languageName} language. Use ONLY {$languageName} words.

IMPORTANT: NE PAS demander la plateforme cible (Web, iOS, Android, mobile, etc.) ou la stack technique (Laravel, Vue.js, React, Flutter, etc.) - ceux-ci ont déjà été déterminés.

Chaque question doit aider à clarifier:
- Les utilisateurs cibles ou le contexte
- Les fonctionnalités ou exigences fonctionnelles clés (PAS la plateforme technique)

Formatez la réponse sous forme d'objet JSON avec une seule clé "questions" contenant un tableau d'objets question.
Chaque objet question doit avoir:
- "id": identifiant unique (nombre)
- "question": le texte de la question
- "type": l'un de "multiple_choice", "text", ou "boolean"
- Si type est "multiple_choice", incluez "options": tableau des réponses possibles
- Si type est "text", incluez éventuellement "placeholder": texte d'indice

NE PAS inclure de markdown, explications ou texte en dehors du JSON. Retournez uniquement l'objet JSON.

Format d'exemple:
{
  "questions": [
    {
      "id": 1,
      "question": "Quel est le public cible principal de cette application?",
      "type": "multiple_choice",
      "options": ["Étudiants", "Propriétaires de petites entreprises", "Travailleurs de la santé", "Grand public"]
    },
    {
      "id": 2,
      "question": "Cette application nécessitera-t-elle une authentification utilisateur?",
      "type": "boolean"
    },
    {
      "id": 3,
      "question": "Y a-t-il des exigences fonctionnelles spécifiques?",
      "type": "text",
      "placeholder": "ex. mises à jour en temps réel, téléchargements de fichiers, fonctionnalité de recherche"
    }
  ]
}

REMEMBER: ALL content MUST be in {$languageName} language. NO English words allowed.

App Idea: {$idea}
PROMPT;
    }

    /**
     * Get the full language name from a language code
     *
     * @param string $code The language code
     * @return string The language name
     */
    protected function getLanguageName(string $code): string
    {
        $languages = [
            'am' => 'Amharic',
            'ar' => 'Arabic',
            'en' => 'English',
            'fr' => 'French',
            'ha' => 'Hausa',
            'ig' => 'Igbo',
            'lg' => 'Luganda',
            'or' => 'Oromo',
            'sw' => 'Swahili',
            'yo' => 'Yoruba',
            'es' => 'Spanish',
            'pt' => 'Portuguese',
            'de' => 'German',
            'it' => 'Italian',
        ];

        return $languages[$code] ?? $code;
    }

    /**
     * Get the platform label from a platform code
     *
     * @param string $code The platform code
     * @return string The platform label
     */
    protected function getPlatformLabel(string $code): string
    {
        $platforms = [
            'web' => 'Web-based Application',
            'ios' => 'iOS Mobile Application',
            'android' => 'Android Mobile Application',
            'both' => 'Cross-platform Mobile Application (iOS & Android)',
        ];

        return $platforms[$code] ?? 'Web-based Application';
    }

}
