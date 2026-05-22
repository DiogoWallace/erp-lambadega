<?php

namespace App\Models\Concerns;

use App\Services\AuditService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

trait LogsActivity
{
    protected static function bootLogsActivity(): void
    {
        static::created(function (Model $model) {
            app(AuditService::class)->logModel('created', $model, null, $model->getAuditNewValues());
        });

        static::updating(function (Model $model) {
            $dirty   = array_keys($model->getDirty());
            $changed = array_diff($dirty, $model->getAuditExclude());

            if (empty($changed)) {
                return;
            }

            app(AuditService::class)->queueUpdate(
                spl_object_id($model),
                array_intersect_key($model->getOriginal(), array_flip($changed)),
                array_intersect_key($model->getDirty(), array_flip($changed)),
            );
        });

        static::updated(function (Model $model) {
            $pending = app(AuditService::class)->dequeuePendingUpdate(spl_object_id($model));

            if (!$pending) {
                return;
            }

            app(AuditService::class)->logModel('updated', $model, $pending['old'], $pending['new']);
        });

        static::deleted(function (Model $model) {
            // Skip force-deletes; soft-deletes are the meaningful event
            if (method_exists($model, 'isForceDeleting') && $model->isForceDeleting()) {
                return;
            }

            app(AuditService::class)->logModel('deleted', $model, ['deleted_at' => now()->toIso8601String()], null);
        });
    }

    public function getAuditModule(): string
    {
        return property_exists(static::class, 'auditModule')
            ? static::$auditModule
            : Str::snake(class_basename(static::class)) . 's';
    }

    public function getAuditNewValues(): array
    {
        return array_diff_key($this->getAttributes(), array_flip($this->getAuditExclude()));
    }

    public function getAuditExclude(): array
    {
        $extra = property_exists(static::class, 'auditExclude') ? static::$auditExclude : [];

        return array_merge(
            ['id', 'establishment_id', 'updated_at', 'created_at', 'deleted_at', 'remember_token'],
            $extra,
        );
    }
}
