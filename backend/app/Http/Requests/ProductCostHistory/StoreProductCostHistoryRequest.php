<?php

namespace App\Http\Requests\ProductCostHistory;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductCostHistoryRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'supplier_id' => [
                'nullable',
                Rule::exists('suppliers', 'id')
                    ->where(fn ($q) => $q->where('establishment_id', $this->user()->establishment_id)),
            ],
            'cost_price'   => ['required', 'numeric', 'min:0.01'],
            'notes'        => ['nullable', 'string', 'max:500'],
            'effective_at' => ['nullable', 'date'],
        ];
    }
}
