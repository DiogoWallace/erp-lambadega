<?php

namespace App\Policies;

use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool { return $user->can('sales.view'); }
    public function view(User $user): bool    { return $user->can('sales.view'); }
    public function create(User $user): bool  { return $user->can('sales.create'); }
    public function update(User $user): bool  { return $user->can('sales.edit'); }
    public function delete(User $user): bool  { return $user->can('sales.delete'); }
}
