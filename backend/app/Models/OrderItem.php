<?php

namespace App\Models;

use App\Models\Concerns\BelongsToEstablishment;
use App\Models\Concerns\HasUuidV7;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'establishment_id', 'order_id', 'product_id', 'quantity',
    'unit_price', 'cost_price', 'discount_amount', 'total_price', 'notes',
])]
class OrderItem extends Model
{
    use BelongsToEstablishment, HasFactory, HasUuidV7;

    protected function casts(): array
    {
        return [
            'quantity'        => 'integer',
            'unit_price'      => 'decimal:2',
            'cost_price'      => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_price'     => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
