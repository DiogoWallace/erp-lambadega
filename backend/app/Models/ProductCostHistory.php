<?php

namespace App\Models;

use App\Models\Concerns\BelongsToEstablishment;
use App\Models\Concerns\HasUuidV7;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'establishment_id', 'product_id', 'supplier_id', 'user_id',
    'stock_movement_id', 'cost_price', 'source', 'notes', 'effective_at',
])]
class ProductCostHistory extends Model
{
    use BelongsToEstablishment, HasUuidV7;

    protected $table = 'product_cost_history';

    public const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'cost_price'   => 'decimal:2',
            'effective_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
