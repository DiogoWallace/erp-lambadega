<?php

namespace App\Http\Requests\StockMovement;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $establishmentId = $this->user()->establishment_id;

        return [
            'product_id'  => [
                'required', 'uuid',
                Rule::exists('products', 'id')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)->whereNull('deleted_at')),
            ],
            'type'        => ['required', Rule::in(['in', 'out', 'adjustment'])],
            'quantity'    => [
                'required', 'integer', 'min:0',
                function ($attribute, $value, $fail) {
                    if (in_array($this->input('type'), ['in', 'out']) && $value < 1) {
                        $fail('A quantidade deve ser maior que zero para entradas e saídas.');
                    }
                },
            ],
            'cost_price'  => ['nullable', 'numeric', 'min:0'],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'product_id.required' => 'O produto é obrigatório.',
            'product_id.exists'   => 'Produto inválido ou não pertence a este estabelecimento.',
            'type.required'       => 'O tipo de movimentação é obrigatório.',
            'type.in'             => 'Tipo inválido. Use: in, out ou adjustment.',
            'quantity.required'   => 'A quantidade é obrigatória.',
            'quantity.integer'    => 'A quantidade deve ser um número inteiro.',
            'quantity.min'        => 'A quantidade não pode ser negativa.',
        ];
    }
}
