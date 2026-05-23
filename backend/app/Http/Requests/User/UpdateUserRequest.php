<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');

        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($userId)],
            'phone'     => ['nullable', 'string', 'max:20'],
            'role'      => ['required', 'string', Rule::exists('roles', 'name')->where('guard_name', 'web')],
            'is_active' => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'  => 'O nome é obrigatório.',
            'email.required' => 'O e-mail é obrigatório.',
            'email.email'    => 'O e-mail informado é inválido.',
            'email.unique'   => 'Este e-mail já está em uso.',
            'role.required'  => 'Selecione um cargo.',
            'role.exists'    => 'Cargo inválido.',
        ];
    }
}
