<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isBroadcast = $this->user_id === null;

        // read_at consolidado: para broadcasts vem do pivot, para pessoais da própria linha.
        $readAt = $this->read_at;
        if ($isBroadcast && $user) {
            $readAt = $this->readers
                ->firstWhere('id', $user->id)
                ?->pivot
                ?->read_at;
        }

        return [
            'id'         => $this->id,
            'type'       => $this->type,
            'severity'   => $this->severity,
            'title'      => $this->title,
            'body'       => $this->body,
            'action_url' => $this->action_url,
            'data'       => $this->data,
            'broadcast'  => $isBroadcast,
            'read_at'    => $readAt,
            'created_at' => $this->created_at,
        ];
    }
}
