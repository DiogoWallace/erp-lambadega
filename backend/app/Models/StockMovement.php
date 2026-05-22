<?php

namespace App\Models;

use App\Models\Concerns\BelongsToEstablishment;
use App\Models\Concerns\HasUuidV7;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable([
    'establishment_id', 'product_id', 'user_id', 'reference_type', 'reference_id',
    'type', 'quantity', 'stock_before', 'stock_after',
    'cost_price', 'description',
])]
class StockMovement extends Model
{
    use BelongsToEstablishment, HasFactory, HasUuidV7, LogsActivity;

    protected static string $auditModule = 'stock';

    protected function casts(): array
    {
        return [
            'quantity'     => 'integer',
            'stock_before' => 'integer',
            'stock_after'  => 'integer',
            'cost_price'   => 'decimal:2',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
