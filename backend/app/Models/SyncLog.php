<?php

namespace App\Models;

use App\Models\Concerns\HasUuidV7;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'establishment_id', 'table_name', 'record_id', 'operation',
    'payload', 'sequence', 'origin', 'origin_server_id', 'applied_at',
])]
class SyncLog extends Model
{
    use HasUuidV7;

    protected $table = 'sync_log';

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'payload'    => 'array',
            'sequence'   => 'integer',
            'applied_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (SyncLog $log) {
            if (empty($log->created_at)) {
                $log->created_at = now();
            }
        });
    }

    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }
}
