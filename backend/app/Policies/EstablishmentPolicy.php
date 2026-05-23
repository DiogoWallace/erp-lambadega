<?php

namespace App\Policies;

use App\Models\Establishment;
use App\Models\User;

class EstablishmentPolicy
{
    public function view(User $user, Establishment $establishment): bool
    {
        if ($establishment->id !== $user->establishment_id) {
            return false;
        }

        return $user->can('settings.view');
    }

    public function update(User $user, Establishment $establishment): bool
    {
        if ($establishment->id !== $user->establishment_id) {
            return false;
        }

        return $user->can('settings.edit');
    }
}
