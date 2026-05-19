<?php

namespace App\Models\Concerns;

use App\Models\Establishment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToEstablishment
{
    protected static function bootBelongsToEstablishment(): void
    {
        static::addGlobalScope('establishment', function (Builder $builder) {
            if ($establishmentId = auth()->user()?->establishment_id) {
                $table = $builder->getModel()->getTable();
                $builder->where("{$table}.establishment_id", $establishmentId);
            }
        });

        static::creating(function (Model $model) {
            if (empty($model->establishment_id) && $establishmentId = auth()->user()?->establishment_id) {
                $model->establishment_id = $establishmentId;
            }
        });
    }

    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }
}
