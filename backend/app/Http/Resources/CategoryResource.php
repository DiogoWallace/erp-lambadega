<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'establishment_id' => $this->establishment_id,
            'parent_id'        => $this->parent_id,
            'parent'           => $this->whenLoaded('parent', fn () => [
                'id'   => $this->parent->id,
                'name' => $this->parent->name,
            ]),
            'name'             => $this->name,
            'slug'             => $this->slug,
            'description'      => $this->description,
            'sort_order'       => $this->sort_order,
            'is_active'        => $this->is_active,
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
