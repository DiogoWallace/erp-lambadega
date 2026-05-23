<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Notification $notification): bool
    {
        if ($notification->establishment_id !== $user->establishment_id) {
            return false;
        }

        return $notification->user_id === null || $notification->user_id === $user->id;
    }

    public function broadcast(User $user): bool
    {
        return $user->can('notification.broadcast');
    }
}
