<?php

namespace App\Http\Requests\FinancialTransaction;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFinancialTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $eid = $this->user()->establishment_id;

        return [
            'type'           => ['sometimes', 'in:income,expense'],
            'category'       => ['nullable', 'string', 'max:50'],
            'description'    => ['sometimes', 'string', 'max:255'],
            'amount'         => ['sometimes', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'in:credit_card,debit_card,pix,cash,bank_transfer,other'],
            'due_date'       => ['sometimes', 'date'],
            'payment_date'   => ['nullable', 'date'],
            'status'         => ['sometimes', 'in:pending,paid,overdue,canceled'],
            'supplier_id'    => [
                'nullable', 'uuid',
                Rule::exists('suppliers', 'id')->where(fn ($q) => $q->where('establishment_id', $eid)),
            ],
            'customer_id'    => [
                'nullable', 'uuid',
                Rule::exists('customers', 'id')->where(fn ($q) => $q->where('establishment_id', $eid)),
            ],
            'notes'          => ['nullable', 'string'],
        ];
    }
}
