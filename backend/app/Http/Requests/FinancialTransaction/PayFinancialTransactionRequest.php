<?php

namespace App\Http\Requests\FinancialTransaction;

use Illuminate\Foundation\Http\FormRequest;

class PayFinancialTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'payment_date'   => ['nullable', 'date'],
            'payment_method' => ['nullable', 'in:credit_card,debit_card,pix,cash,bank_transfer,other'],
        ];
    }
}
