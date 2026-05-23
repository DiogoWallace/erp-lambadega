<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * Operações do próprio usuário sobre seus dados: atualização de perfil e
 * troca de senha. Sempre opera sobre $user atual (auth()) — não recebe id.
 */
class UserProfileService
{
    public function updateProfile(User $user, array $data): User
    {
        $user->update([
            'name'  => $data['name']  ?? $user->name,
            'email' => $data['email'] ?? $user->email,
            'phone' => array_key_exists('phone', $data) ? $data['phone'] : $user->phone,
        ]);

        return $user->fresh();
    }

    /**
     * Troca a senha após validar a senha atual. Revoga todos os outros tokens
     * Sanctum (mantém só o atual) — força re-login nos demais dispositivos.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): bool
    {
        if (!Hash::check($currentPassword, $user->password)) {
            return false;
        }

        $user->update(['password' => $newPassword]);

        $currentTokenId = $user->currentAccessToken()?->id;
        $user->tokens()
            ->when($currentTokenId, fn ($q) => $q->where('id', '!=', $currentTokenId))
            ->delete();

        return true;
    }
}
