<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class PayOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_method' => 'required|in:credit_card,debit_card,pix,cash,bank_transfer,other',
            'installments'   => 'nullable|integer|min:1|max:12',
        ];
    }
}
