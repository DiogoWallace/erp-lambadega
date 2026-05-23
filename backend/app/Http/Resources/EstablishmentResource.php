<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EstablishmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
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
            'is_active'          => (bool) $this->is_active,
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
