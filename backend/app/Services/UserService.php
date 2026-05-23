<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * CRUD de usuários dentro do estabelecimento corrente (escopo aplicado
 * automaticamente pelo trait BelongsToEstablishment no model User).
 */
class UserService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return User::query()
            ->with('roles:id,name')
            ->when($filters['search'] ?? null, function ($q, $v) {
                $q->where(function ($q) use ($v) {
                    $q->where('name', 'like', "%{$v}%")
                      ->orWhere('email', 'like', "%{$v}%");
                });
            })
            ->when(isset($filters['is_active']) && $filters['is_active'] !== '', function ($q) use ($filters) {
                $q->where('is_active', (bool) $filters['is_active']);
            })
            ->when($filters['role'] ?? null, function ($q, $role) {
                $q->whereHas('roles', fn ($q) => $q->where('name', $role));
            })
            ->orderBy('name')
            ->paginate(20);
    }

    public function find(string $id): User
    {
        return User::with('roles:id,name')->findOrFail($id);
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => $data['password'],
                'phone'    => $data['phone'] ?? null,
            ]);

            $user->assignRole($data['role']);

            return $user->load('roles:id,name');
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data) {
            $user->update([
                'name'      => $data['name'],
                'email'     => $data['email'],
                'phone'     => array_key_exists('phone', $data) ? $data['phone'] : $user->phone,
                'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : $user->is_active,
            ]);

            if (!empty($data['role'])) {
                $user->syncRoles([$data['role']]);
            }

            // Desativar o usuário também revoga tokens ativos
            if (array_key_exists('is_active', $data) && !$data['is_active']) {
                $user->tokens()->delete();
            }

            return $user->fresh()->load('roles:id,name');
        });
    }

    public function delete(User $user): void
    {
        $user->tokens()->delete();
        $user->delete();
    }

    /**
     * Gera senha temporária, marca must_change_password e revoga tokens
     * existentes. Retorna a senha em claro pra ser exibida ao admin.
     */
    public function resetPassword(User $user): string
    {
        $newPassword = Str::random(12);

        $user->update([
            'password'             => $newPassword,
            'must_change_password' => true,
        ]);

        $user->tokens()->delete();

        return $newPassword;
    }
}
