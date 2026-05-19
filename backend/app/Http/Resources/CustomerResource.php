<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'establishment_id'   => $this->establishment_id,
            'type'               => $this->type,
            'name'               => $this->name,
            'trade_name'         => $this->trade_name,
            'document'           => $this->document,
            'email'              => $this->email,
            'phone'              => $this->phone,
            'address'            => $this->address,
            'address_number'     => $this->address_number,
            'address_complement' => $this->address_complement,
            'neighborhood'       => $this->neighborhood,
            'city'               => $this->city,
            'state'              => $this->state,
            'zip_code'           => $this->zip_code,
            'notes'              => $this->notes,
            'is_active'          => $this->is_active,
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
