<?php

namespace App\Models;

use App\Models\Concerns\BelongsToEstablishment;
use App\Models\Concerns\HasUuidV7;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'establishment_id', 'order_number', 'customer_id', 'user_id',
    'subtotal_amount', 'discount_amount', 'discount_type', 'total_amount',
    'status', 'payment_method', 'paid_at', 'notes',
])]
class Order extends Model
{
    use BelongsToEstablishment, HasFactory, HasUuidV7, LogsActivity, SoftDeletes;

    protected static string $auditModule = 'sales';

    protected function casts(): array
    {
        return [
            'subtotal_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount'    => 'decimal:2',
            'paid_at'         => 'datetime',
            'deleted_at'      => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class);
    }

    public function stockMovements(): MorphMany
    {
        return $this->morphMany(StockMovement::class, 'reference');
    }
}
