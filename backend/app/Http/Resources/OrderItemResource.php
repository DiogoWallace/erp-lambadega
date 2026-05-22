<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'product_id'      => $this->product_id,
            'quantity'        => $this->quantity,
            'unit_price'      => $this->unit_price,
            'cost_price'      => $this->cost_price,
            'discount_amount' => $this->discount_amount,
            'total_price'     => $this->total_price,
            'notes'           => $this->notes,
            'product'         => $this->whenLoaded('product', fn () => [
                'id'   => $this->product->id,
                'name' => $this->product->name,
                'sku'  => $this->product->sku,
            ]),
        ];
    }
}
