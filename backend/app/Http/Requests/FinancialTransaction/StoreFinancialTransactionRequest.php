<?php

namespace App\Http\Requests\FinancialTransaction;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFinancialTransactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $eid = $this->user()->establishment_id;

        return [
            'type'           => ['required', 'in:income,expense'],
            'category'       => ['nullable', 'string', 'max:50'],
            'description'    => ['required', 'string', 'max:255'],
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'payment_method' => ['nullable', 'in:credit_card,debit_card,pix,cash,bank_transfer,other'],
            'due_date'       => ['required', 'date'],
            'payment_date'   => ['nullable', 'date'],
            'status'         => ['nullable', 'in:pending,paid,overdue,canceled'],
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

    public function messages(): array
    {
        return [
            'type.required'        => 'O tipo (receita ou despesa) é obrigatório.',
            'description.required' => 'A descrição é obrigatória.',
            'amount.required'      => 'O valor é obrigatório.',
            'amount.min'           => 'O valor deve ser maior que zero.',
            'due_date.required'    => 'A data de vencimento é obrigatória.',
        ];
    }
}
