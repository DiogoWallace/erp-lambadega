<?php

namespace App\Models;

use App\Models\Concerns\BelongsToEstablishment;
use App\Models\Concerns\HasUuidV7;
use App\Models\Concerns\LogsActivity;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'establishment_id', 'type', 'name', 'trade_name', 'document', 'email', 'phone',
    'address', 'address_number', 'address_complement', 'neighborhood',
    'city', 'state', 'zip_code', 'notes', 'is_active',
])]
class Customer extends Model
{
    use BelongsToEstablishment, HasFactory, HasUuidV7, LogsActivity, SoftDeletes;

    protected static string $auditModule = 'customers';

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'deleted_at' => 'datetime',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class);
    }
}
