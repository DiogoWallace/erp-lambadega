<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Operações do próprio usuário sobre seus dados: atualização de perfil,
 * troca de senha e upload/remoção de avatar. Sempre opera sobre $user
 * atual (auth()) — não recebe id.
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

    /**
     * Salva o avatar no disco `public` e atualiza users.avatar_path.
     * Deleta o avatar anterior se existir.
     */
    public function updateAvatar(User $user, UploadedFile $file): User
    {
        $extension = $file->getClientOriginalExtension() ?: $file->extension();
        $filename  = Str::uuid7() . '.' . strtolower($extension);
        $path      = "users/{$user->id}/{$filename}";

        Storage::disk('public')->putFileAs("users/{$user->id}", $file, $filename);

        $this->deleteAvatarFile($user->avatar_path);

        $user->update(['avatar_path' => $path]);

        return $user->fresh();
    }

    public function removeAvatar(User $user): User
    {
        $this->deleteAvatarFile($user->avatar_path);

        $user->update(['avatar_path' => null]);

        return $user->fresh();
    }

    private function deleteAvatarFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
