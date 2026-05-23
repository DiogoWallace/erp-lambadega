<?php

namespace App\Http\Requests\Me;

use Illuminate\Foundation\Http\FormRequest;

class ChangePasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'new_password'     => ['required', 'string', 'min:8', 'confirmed', 'different:current_password'],
        ];
    }

    public function messages(): array
    {
        return [
            'current_password.required' => 'Informe a senha atual.',
            'new_password.required'     => 'Informe a nova senha.',
            'new_password.min'          => 'A nova senha deve ter pelo menos 8 caracteres.',
            'new_password.confirmed'    => 'A confirmação da nova senha não confere.',
            'new_password.different'    => 'A nova senha deve ser diferente da atual.',
        ];
    }
}
