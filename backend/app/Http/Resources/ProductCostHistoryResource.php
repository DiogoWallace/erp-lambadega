<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductCostHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'product_id'        => $this->product_id,
            'supplier_id'       => $this->supplier_id,
            'stock_movement_id' => $this->stock_movement_id,
            'cost_price'        => $this->cost_price,
            'source'            => $this->source,
            'notes'             => $this->notes,
            'effective_at'      => $this->effective_at,
            'created_at'        => $this->created_at,
            'supplier'          => $this->whenLoaded('supplier', fn () => [
                'id'           => $this->supplier->id,
                'company_name' => $this->supplier->company_name,
            ]),
            'user'              => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
        ];
    }
}
