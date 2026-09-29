<?php

namespace App\Http\Resources;

use App\Models\PromptGeneration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * @mixin PromptGeneration
 */
class PromptGenerationResource extends JsonResource
{
    /**
     * The list view gets a summary; the detail view adds the full result.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $result = $this->result ?? [];

        return [
            'id' => $this->id,
            'idea' => $this->idea,
            'idea_excerpt' => Str::limit($this->idea, 160),
            'target_platform' => $this->target_platform,
            'language' => $this->language,
            'counts' => [
                'roles' => count($result['roles'] ?? []),
                'agents' => count($result['agents'] ?? []),
                'prompts' => count($result['backend_prompts'] ?? []) + count($result['frontend_prompts'] ?? []),
            ],
            'created_at' => $this->created_at?->toISOString(),
            'follow_up_answers' => $this->when($request->routeIs('prompts.show'), fn () => $this->follow_up_answers ?? []),
            'result' => $this->when($request->routeIs('prompts.show'), fn () => $result),
        ];
    }
}
