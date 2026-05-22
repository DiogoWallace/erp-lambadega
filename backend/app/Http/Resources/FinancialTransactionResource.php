<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FinancialTransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'type'               => $this->type,
            'category'           => $this->category,
            'description'        => $this->description,
            'amount'             => $this->amount,
            'payment_method'     => $this->payment_method,
            'due_date'           => $this->due_date?->toDateString(),
            'payment_date'       => $this->payment_date?->toDateString(),
            'status'             => $this->status,
            'installment_number' => $this->installment_number,
            'installment_count'  => $this->installment_count,
            'notes'              => $this->notes,
            'order_id'           => $this->order_id,
            'customer_id'        => $this->customer_id,
            'supplier_id'        => $this->supplier_id,
            'order'              => $this->whenLoaded('order', fn () => [
                'id'           => $this->order->id,
                'order_number' => $this->order->order_number,
            ]),
            'customer'           => $this->whenLoaded('customer', fn () => [
                'id'   => $this->customer->id,
                'name' => $this->customer->name,
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
