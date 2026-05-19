<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $establishmentId = $this->user()->establishment_id;

        return [
            'name'        => [
                'required', 'string', 'max:255',
                Rule::unique('categories', 'name')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)),
            ],
            'description' => ['nullable', 'string'],
            'parent_id'   => [
                'nullable', 'uuid',
                Rule::exists('categories', 'id')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)),
            ],
            'sort_order'  => ['nullable', 'integer', 'min:0'],
            'is_active'   => ['boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome é obrigatório.',
            'name.unique'   => 'Já existe uma categoria com este nome.',
            'parent_id.exists' => 'Categoria pai não encontrada.',
        ];
    }
}
