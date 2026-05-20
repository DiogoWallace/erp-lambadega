<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupplierResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'establishment_id' => $this->establishment_id,
            'company_name'     => $this->company_name,
            'trade_name'       => $this->trade_name,
            'cnpj'             => $this->cnpj,
            'contact_name'     => $this->contact_name,
            'email'            => $this->email,
            'phone'            => $this->phone,
            'website'          => $this->website,
            'address'          => $this->address,
            'city'             => $this->city,
            'state'            => $this->state,
            'zip_code'         => $this->zip_code,
            'notes'            => $this->notes,
            'is_active'        => $this->is_active,
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
