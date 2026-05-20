<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $establishmentId = $this->user()->establishment_id;

        return [
            'company_name'  => ['required', 'string', 'max:255'],
            'trade_name'    => ['nullable', 'string', 'max:255'],
            'cnpj'          => [
                'nullable', 'string', 'max:20',
                Rule::unique('suppliers', 'cnpj')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)),
            ],
            'contact_name'  => ['nullable', 'string', 'max:255'],
            'email'         => ['nullable', 'email', 'max:255'],
            'phone'         => ['nullable', 'string', 'max:20'],
            'website'       => ['nullable', 'url', 'max:255'],
            'address'       => ['nullable', 'string', 'max:255'],
            'city'          => ['nullable', 'string', 'max:255'],
            'state'         => ['nullable', 'string', 'size:2'],
            'zip_code'      => ['nullable', 'string', 'max:10'],
            'notes'         => ['nullable', 'string'],
            'is_active'     => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'company_name.required' => 'A razão social é obrigatória.',
            'cnpj.unique'           => 'Este CNPJ já está cadastrado.',
            'email.email'           => 'O e-mail informado é inválido.',
            'website.url'           => 'O site informado é inválido.',
            'state.size'            => 'O estado deve ser a sigla com 2 letras (ex: SP).',
        ];
    }
}
