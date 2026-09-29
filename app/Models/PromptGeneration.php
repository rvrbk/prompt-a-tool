<?php

namespace App\Models;

use Database\Factories\PromptGenerationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['idea', 'target_platform', 'language', 'follow_up_answers', 'result'])]
class PromptGeneration extends Model
{
    /** @use HasFactory<PromptGenerationFactory> */
    use HasFactory;

    /**
     * The generated sections stored in `result`
     */
    public const RESULT_KEYS = ['roles', 'agents', 'backend_prompts', 'frontend_prompts'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'follow_up_answers' => 'array',
            'result' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
