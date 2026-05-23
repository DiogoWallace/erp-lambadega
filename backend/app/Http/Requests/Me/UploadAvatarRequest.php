<?php

namespace App\Http\Requests\Me;

use Illuminate\Foundation\Http\FormRequest;

class UploadAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avatar' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:2048',  // 2 MB
                'dimensions:max_width=2000,max_height=2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required'    => 'Selecione uma imagem.',
            'avatar.image'       => 'O arquivo precisa ser uma imagem.',
            'avatar.mimes'       => 'Formatos aceitos: JPG, PNG ou WEBP.',
            'avatar.max'         => 'A imagem deve ter no máximo 2 MB.',
            'avatar.dimensions'  => 'A imagem deve ter no máximo 2000×2000 pixels.',
        ];
    }
}
