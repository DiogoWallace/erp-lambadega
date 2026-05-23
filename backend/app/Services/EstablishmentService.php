<?php

namespace App\Services;

use App\Models\Establishment;
use App\Models\User;

/**
 * Operações de leitura/escrita do estabelecimento corrente do usuário.
 * O modelo Establishment é singleton por tenant (cada user pertence a um).
 */
class EstablishmentService
{
    public function forUser(User $user): ?Establishment
    {
        return $user->establishment_id
            ? Establishment::find($user->establishment_id)
            : null;
    }

    public function update(Establishment $establishment, array $data): Establishment
    {
        $establishment->update($data);

        return $establishment->fresh();
    }
}
