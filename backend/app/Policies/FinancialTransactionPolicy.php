<?php

namespace App\Policies;

use App\Models\FinancialTransaction;
use App\Models\User;

class FinancialTransactionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('finance.view');
    }

    public function view(User $user, FinancialTransaction $transaction): bool
    {
        return $user->can('finance.view');
    }

    public function create(User $user): bool
    {
        return $user->can('finance.create');
    }

    public function update(User $user, FinancialTransaction $transaction): bool
    {
        return $user->can('finance.edit');
    }

    public function delete(User $user, FinancialTransaction $transaction): bool
    {
        return $user->can('finance.delete');
    }
}
