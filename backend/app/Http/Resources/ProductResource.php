<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'establishment_id'   => $this->establishment_id,
            'category_id'        => $this->category_id,
            'supplier_id'        => $this->supplier_id,
            'name'               => $this->name,
            'description'        => $this->description,
            'brand'              => $this->brand,
            'sku'                => $this->sku,
            'barcode'            => $this->barcode,
            'unit'               => $this->unit,
            'cost_price'         => $this->cost_price,
            'sale_price'         => $this->sale_price,
            'stock_quantity'     => $this->stock_quantity,
            'min_stock_quantity' => $this->min_stock_quantity,
            'image_path'         => $this->image_path,
            'is_active'          => $this->is_active,
            'is_low_stock'       => $this->isLowStock(),
            'category'           => $this->whenLoaded('category', fn () => [
                'id'   => $this->category->id,
                'name' => $this->category->name,
            ]),
            'supplier'           => $this->whenLoaded('supplier', fn () => [
                'id'           => $this->supplier->id,
                'company_name' => $this->supplier->company_name,
            ]),
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
