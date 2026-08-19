<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Services\MistralService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controller for managing app templates
 *
 * This controller provides endpoints for fetching and managing
 * Africa-specific templates for the prompt generator.
 */
class TemplateController extends Controller
{
    /**
     * Get all templates
     *
     * Returns a list of all available templates, optionally filtered by category.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $category = $request->query('category');
        
        $query = Template::ordered();
        
        if ($category) {
            $query->byCategory($category);
        }
        
        $templates = $query->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $templates,
            'count' => $templates->count(),
        ]);
    }

    /**
     * Get featured templates
     *
     * Returns only the featured templates for the homepage.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function featured(): JsonResponse
    {
        $templates = Template::featured()->get();
        
        return response()->json([
            'status' => 'success',
            'data' => $templates,
            'count' => $templates->count(),
        ]);
    }

    /**
     * Get categories
     *
     * Returns a list of all available template categories.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function categories(): JsonResponse
    {
        $categories = Template::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');
        
        return response()->json([
            'status' => 'success',
            'data' => $categories,
            'count' => $categories->count(),
        ]);
    }

    /**
     * Get a specific template by ID
     *
     * Returns detailed information about a specific template.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $template = Template::find($id);
        
        if (!$template) {
            return response()->json([
                'status' => 'error',
                'message' => 'Template not found',
            ], 404);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => $template,
        ]);
    }

    /**
     * Apply a template to get pre-filled questionnaire data
     *
     * Returns the questionnaire data from a template that can be used
     * to pre-fill the frontend form.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function apply(int $id): JsonResponse
    {
        $template = Template::find($id);
        
        if (!$template) {
            return response()->json([
                'status' => 'error',
                'message' => 'Template not found',
            ], 404);
        }
        
        if (!$template->questionnaire_data) {
            return response()->json([
                'status' => 'error',
                'message' => 'Template has no questionnaire data',
            ], 400);
        }
        
        return response()->json([
            'status' => 'success',
            'data' => [
                'template' => [
                    'id' => $template->id,
                    'name' => $template->name,
                    'description' => $template->description,
                    'category' => $template->category,
                    'icon' => $template->icon,
                ],
                'questionnaire_data' => $template->questionnaire_data,
                'predefined_roles' => $template->predefined_roles,
                'predefined_agents' => $template->predefined_agents,
                'predefined_prompts' => $template->predefined_prompts,
            ],
        ]);
    }

    /**
     * Get all template metadata (for dropdowns, etc.)
     *
     * Returns a lightweight version of all templates for use in frontend dropdowns.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function metadata(): JsonResponse
    {
        $templates = Template::ordered()->get([
            'id',
            'name',
            'description',
            'category',
            'icon',
            'is_featured',
        ]);
        
        return response()->json([
            'status' => 'success',
            'data' => $templates,
            'count' => $templates->count(),
        ]);
    }

    /**
     * Get templates from Mistral AI
     *
     * Fetches templates dynamically from Mistral AI based on optional category filter
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Services\MistralService  $mistralService
     * @return \Illuminate\Http\JsonResponse
     */
    public function mistralTemplates(Request $request, MistralService $mistralService): JsonResponse
    {
        $category = $request->query('category');
        $context = $request->query('context');

        try {
            if (!$mistralService->isConfigured()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Mistral API is not configured. Please set MISTRAL_API_KEY in your .env file.',
                ], 500);
            }

            $templates = $mistralService->fetchTemplates($category, $context);

            return response()->json([
                'status' => 'success',
                'data' => $templates,
                'count' => count($templates),
                'source' => 'mistral',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to fetch templates from Mistral: ' . $e->getMessage(),
            ], 500);
        }
    }
}
