<?php

namespace App\Http\Requests\Establishment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEstablishmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                => ['required', 'string', 'max:255'],
            'trade_name'          => ['nullable', 'string', 'max:255'],
            'document'            => ['nullable', 'string', 'max:20'],
            'email'               => ['nullable', 'email', 'max:255'],
            'phone'               => ['nullable', 'string', 'max:20'],
            'address'             => ['nullable', 'string', 'max:255'],
            'address_number'      => ['nullable', 'string', 'max:20'],
            'address_complement'  => ['nullable', 'string', 'max:255'],
            'neighborhood'        => ['nullable', 'string', 'max:255'],
            'city'                => ['nullable', 'string', 'max:255'],
            'state'               => ['nullable', 'string', 'size:2'],
            'zip_code'            => ['nullable', 'string', 'max:10'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome do estabelecimento é obrigatório.',
            'email.email'   => 'O e-mail informado é inválido.',
            'state.size'    => 'O estado deve ser a sigla com 2 letras (ex: SP).',
        ];
    }
}
