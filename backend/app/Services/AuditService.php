<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class AuditService
{
    private array $pendingUpdates = [];

    // -------------------------------------------------------------------------
    // State management for the updating/updated observer pair
    // -------------------------------------------------------------------------

    public function queueUpdate(int $objectId, array $old, array $new): void
    {
        $this->pendingUpdates[$objectId] = compact('old', 'new');
    }

    public function dequeuePendingUpdate(int $objectId): ?array
    {
        $pending = $this->pendingUpdates[$objectId] ?? null;
        unset($this->pendingUpdates[$objectId]);
        return $pending;
    }

    // -------------------------------------------------------------------------
    // Logging
    // -------------------------------------------------------------------------

    public function logModel(string $event, Model $model, ?array $oldValues, ?array $newValues): void
    {
        try {
            $user            = auth()->user();
            $establishmentId = $model->establishment_id ?? $user?->establishment_id;

            if (!$establishmentId) {
                return;
            }

            AuditLog::create([
                'establishment_id' => $establishmentId,
                'user_id'          => $user?->id,
                'event'            => $event,
                'module'           => $model->getAuditModule(),
                'model_type'       => get_class($model),
                'model_id'         => (string) $model->getKey(),
                'old_values'       => $oldValues ?: null,
                'new_values'       => $newValues ?: null,
                'ip_address'       => request()?->ip(),
                'user_agent'       => request()?->userAgent(),
            ]);
        } catch (\Throwable) {
            // Never break the main operation due to audit failure
        }
    }

    public function log(string $event, string $module, ?string $userId = null, ?string $establishmentId = null): void
    {
        try {
            $user = auth()->user();

            AuditLog::create([
                'establishment_id' => $establishmentId ?? $user?->establishment_id,
                'user_id'          => $userId ?? $user?->id,
                'event'            => $event,
                'module'           => $module,
                'model_type'       => null,
                'model_id'         => null,
                'old_values'       => null,
                'new_values'       => null,
                'ip_address'       => request()?->ip(),
                'user_agent'       => request()?->userAgent(),
            ]);
        } catch (\Throwable) {
            // Never break the main operation due to audit failure
        }
    }

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------

    public function paginate(array $filters = []): LengthAwarePaginator
    {
        return AuditLog::with('user:id,name')
            ->where('establishment_id', auth()->user()->establishment_id)
            ->when($filters['event'] ?? null, fn ($q, $v) => $q->where('event', $v))
            ->when($filters['module'] ?? null, fn ($q, $v) => $q->where('module', $v))
            ->when($filters['date_from'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['date_to'] ?? null, fn ($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->latest()
            ->paginate(50);
    }

    public function find(string $id): ?AuditLog
    {
        return AuditLog::with('user:id,name')
            ->where('establishment_id', auth()->user()->establishment_id)
            ->find($id);
    }
}
