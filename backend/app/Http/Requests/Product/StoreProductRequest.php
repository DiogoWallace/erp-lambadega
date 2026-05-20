<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $establishmentId = $this->user()->establishment_id;

        return [
            'name'               => ['required', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'brand'              => ['nullable', 'string', 'max:255'],
            'sku'                => [
                'nullable', 'string', 'max:100',
                Rule::unique('products', 'sku')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)),
            ],
            'barcode'            => [
                'nullable', 'string', 'max:100',
                Rule::unique('products', 'barcode')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)),
            ],
            'unit'               => ['nullable', Rule::in(['un', 'kg', 'g', 'l', 'ml', 'cx'])],
            'cost_price'         => ['nullable', 'numeric', 'min:0'],
            'sale_price'         => ['nullable', 'numeric', 'min:0'],
            'stock_quantity'     => ['nullable', 'integer', 'min:0'],
            'min_stock_quantity' => ['nullable', 'integer', 'min:0'],
            'image_path'         => ['nullable', 'string', 'max:255'],
            'is_active'          => ['boolean'],
            'category_id'        => [
                'nullable', 'uuid',
                Rule::exists('categories', 'id')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)->whereNull('deleted_at')),
            ],
            'supplier_id'        => [
                'nullable', 'uuid',
                Rule::exists('suppliers', 'id')
                    ->where(fn ($q) => $q->where('establishment_id', $establishmentId)->whereNull('deleted_at')),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'       => 'O nome do produto é obrigatório.',
            'sku.unique'          => 'Este SKU já está cadastrado.',
            'barcode.unique'      => 'Este código de barras já está cadastrado.',
            'unit.in'             => 'Unidade inválida.',
            'cost_price.min'      => 'O preço de custo não pode ser negativo.',
            'sale_price.min'      => 'O preço de venda não pode ser negativo.',
            'category_id.exists'  => 'Categoria inválida.',
            'supplier_id.exists'  => 'Fornecedor inválido.',
        ];
    }
}
