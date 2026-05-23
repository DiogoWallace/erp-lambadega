<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'phone'    => ['nullable', 'string', 'max:20'],
            'password' => ['required', 'string', 'min:8'],
            'role'     => ['required', 'string', Rule::exists('roles', 'name')->where('guard_name', 'web')],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'     => 'O nome é obrigatório.',
            'email.required'    => 'O e-mail é obrigatório.',
            'email.email'       => 'O e-mail informado é inválido.',
            'email.unique'      => 'Este e-mail já está em uso.',
            'password.required' => 'A senha inicial é obrigatória.',
            'password.min'      => 'A senha deve ter pelo menos 8 caracteres.',
            'role.required'     => 'Selecione um cargo.',
            'role.exists'       => 'Cargo inválido.',
        ];
    }
}
