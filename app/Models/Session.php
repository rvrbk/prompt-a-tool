<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'user_sessions';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'session_id',
        'user_id',
        'name',
        'questionnaire_data',
        'generated_data',
        'is_anonymous',
        'ip_address',
        'user_agent',
        'share_token',
        'is_shared',
        'shared_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'questionnaire_data' => 'array',
        'generated_data' => 'array',
        'is_anonymous' => 'boolean',
        'is_shared' => 'boolean',
        'shared_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the session.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get sessions for a specific user.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  int|null  $userId
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeForUser($query, ?int $userId = null): \Illuminate\Database\Eloquent\Builder
    {
        if ($userId) {
            return $query->where('user_id', $userId);
        }
        return $query->whereNull('user_id')->where('is_anonymous', true);
    }

    /**
     * Scope to get anonymous sessions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeAnonymous($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_anonymous', true);
    }

    /**
     * Scope to order sessions by most recently created.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeRecent($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Generate a unique session ID.
     *
     * @return string
     */
    public static function generateSessionId(): string
    {
        return 'sess_' . bin2hex(random_bytes(16)) . '_' . time();
    }

    /**
     * Generate a unique share token.
     *
     * @return string
     */
    public static function generateShareToken(): string
    {
        return 'share_' . bin2hex(random_bytes(8)) . '_' . substr(md5(uniqid((string) rand(), true)), 0, 8);
    }

    /**
     * Scope to get shared sessions.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeShared($query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('is_shared', true)->whereNotNull('share_token');
    }

    /**
     * Scope to get session by share token.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @param  string  $token
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeByShareToken($query, string $token): \Illuminate\Database\Eloquent\Builder
    {
        return $query->where('share_token', $token);
    }
}
