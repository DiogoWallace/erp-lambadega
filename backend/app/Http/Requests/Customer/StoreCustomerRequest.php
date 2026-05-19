<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $establishmentId = $this->user()->establishment_id;

        return [
            'type'                => ['required', Rule::in(['individual', 'company'])],
            'name'                => ['required', 'string', 'max:255'],
            'trade_name'          => ['nullable', 'string', 'max:255'],
            'document'            => [
                'nullable', 'string', 'max:20',
                Rule::unique('customers', 'document')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)),
            ],
            'email'               => ['nullable', 'email', 'max:255'],
            'phone'               => ['nullable', 'string', 'max:20'],
            'address'             => ['nullable', 'string', 'max:255'],
            'address_number'      => ['nullable', 'string', 'max:20'],
            'address_complement'  => ['nullable', 'string', 'max:255'],
            'neighborhood'        => ['nullable', 'string', 'max:255'],
            'city'                => ['nullable', 'string', 'max:255'],
            'state'               => ['nullable', 'string', 'size:2'],
            'zip_code'            => ['nullable', 'string', 'max:10'],
            'notes'               => ['nullable', 'string'],
            'is_active'           => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required'      => 'O tipo é obrigatório.',
            'type.in'            => 'O tipo deve ser pessoa física ou jurídica.',
            'name.required'      => 'O nome é obrigatório.',
            'document.unique'    => 'Este CPF/CNPJ já está cadastrado.',
            'email.email'        => 'O e-mail informado é inválido.',
            'state.size'         => 'O estado deve ser a sigla com 2 letras (ex: SP).',
        ];
    }
}
