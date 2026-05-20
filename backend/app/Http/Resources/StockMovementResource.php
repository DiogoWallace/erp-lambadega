<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'product_id'   => $this->product_id,
            'user_id'      => $this->user_id,
            'type'         => $this->type,
            'quantity'     => $this->quantity,
            'stock_before' => $this->stock_before,
            'stock_after'  => $this->stock_after,
            'cost_price'   => $this->cost_price,
            'description'  => $this->description,
            'product'      => $this->whenLoaded('product', fn () => [
                'id'   => $this->product->id,
                'name' => $this->product->name,
            ]),
            'user'         => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
            'created_at'   => $this->created_at,
        ];
    }
}
