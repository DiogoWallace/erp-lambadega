<?php

namespace App\Models;

use App\Models\Concerns\BelongsToEstablishment;
use App\Models\Concerns\HasUuidV7;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Fillable([
    'establishment_id', 'user_id', 'type', 'severity', 'title',
    'body', 'action_url', 'data', 'read_at',
])]
class Notification extends Model
{
    use HasUuidV7;
    use BelongsToEstablishment;

    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'data'    => 'array',
            'read_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function readers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'notification_reads')
            ->withPivot('read_at');
    }

    public function isBroadcast(): bool
    {
        return $this->user_id === null;
    }
}
