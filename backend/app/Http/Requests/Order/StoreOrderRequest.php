<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $eid = auth()->user()->establishment_id;

        return [
            'customer_id'              => [
                'nullable', 'uuid',
                Rule::exists('customers', 'id')->where('establishment_id', $eid),
            ],
            'items'                    => 'required|array|min:1',
            'items.*.unit_price'        => 'nullable|numeric|min:0',
            'items.*.product_id'       => [
                'required', 'uuid',
                Rule::exists('products', 'id')
                    ->where('establishment_id', $eid)
                    ->where('is_active', true),
            ],
            'items.*.quantity'         => 'required|integer|min:1',
            'items.*.discount_amount'  => 'nullable|numeric|min:0',
            'items.*.notes'            => 'nullable|string|max:255',
            'discount_type'            => 'nullable|in:fixed,percentage',
            'discount_amount'          => 'nullable|numeric|min:0',
            'payment_method'           => 'nullable|in:credit_card,debit_card,pix,cash,bank_transfer,other',
            'installments'             => 'nullable|integer|min:1|max:12',
            'notes'                    => 'nullable|string',
        ];
    }
}
