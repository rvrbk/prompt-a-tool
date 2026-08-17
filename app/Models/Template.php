<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'category',
        'icon',
        'questionnaire_data',
        'predefined_roles',
        'predefined_agents',
        'predefined_prompts',
        'is_featured',
        'order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'questionnaire_data' => 'array',
        'predefined_roles' => 'array',
        'predefined_agents' => 'array',
        'predefined_prompts' => 'array',
        'is_featured' => 'boolean',
    ];

    /**
     * Get templates by category.
     */
    public static function byCategory(string $category): \Illuminate\Database\Eloquent\Builder
    {
        return self::where('category', $category);
    }

    /**
     * Get featured templates.
     */
    public static function featured(): \Illuminate\Database\Eloquent\Builder
    {
        return self::where('is_featured', true)->orderBy('order');
    }

    /**
     * Get all templates ordered by order and name.
     */
    public static function ordered(): \Illuminate\Database\Eloquent\Builder
    {
        return self::orderBy('order')->orderBy('name');
    }
}
