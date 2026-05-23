<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    public function view(User $user, User $target): bool
    {
        return $user->can('users.view');
    }

    public function create(User $user): bool
    {
        return $user->can('users.create');
    }

    public function update(User $user, User $target): bool
    {
        return $user->can('users.edit');
    }

    public function delete(User $user, User $target): bool
    {
        if ($user->id === $target->id) {
            return false; // não pode deletar a si mesmo
        }

        return $user->can('users.delete');
    }

    public function resetPassword(User $user, User $target): bool
    {
        if ($user->id === $target->id) {
            return false; // use POST /me/password para trocar a própria senha
        }

        return $user->can('users.edit');
    }
}
