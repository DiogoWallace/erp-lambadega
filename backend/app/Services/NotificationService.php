<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Dono único da criação/leitura de notificações.
 *
 * Notificações pessoais: user_id setado, read_at na própria linha.
 * Notificações broadcast: user_id NULL, leitura por usuário via pivot
 * notification_reads. Veja `forUser()` para a query consolidada.
 */
class NotificationService
{
    /**
     * Notificação pessoal — destinada a um único usuário.
     */
    public function createForUser(
        string $userId,
        string $type,
        string $title,
        string $severity = 'info',
        ?string $body = null,
        ?string $actionUrl = null,
        ?array $data = null,
        ?string $establishmentId = null,
    ): ?Notification {
        try {
            // Sem auth (comando agendado): exige establishment_id explícito.
            $establishmentId ??= auth()->user()?->establishment_id;
            if (!$establishmentId) {
                return null;
            }

            if ($data !== null && $this->hasUnreadDuplicate($userId, $type, $data, $establishmentId)) {
                return null;
            }

            return Notification::create([
                'establishment_id' => $establishmentId,
                'user_id'          => $userId,
                'type'             => $type,
                'severity'         => $severity,
                'title'            => $title,
                'body'             => $body,
                'action_url'       => $actionUrl,
                'data'             => $data,
            ]);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Notificação broadcast — todos os usuários do estabelecimento veem.
     * Dedup: se já existe uma broadcast do mesmo tipo e mesma referência em
     * `data` nas últimas $dedupHours horas, não cria de novo.
     */
    public function createBroadcast(
        string $establishmentId,
        string $type,
        string $title,
        string $severity = 'info',
        ?string $body = null,
        ?string $actionUrl = null,
        ?array $data = null,
        int $dedupHours = 24,
    ): ?Notification {
        try {
            if ($data !== null && $this->hasRecentBroadcast($establishmentId, $type, $data, $dedupHours)) {
                return null;
            }

            return Notification::create([
                'establishment_id' => $establishmentId,
                'user_id'          => null,
                'type'             => $type,
                'severity'         => $severity,
                'title'            => $title,
                'body'             => $body,
                'action_url'       => $actionUrl,
                'data'             => $data,
            ]);
        } catch (\Throwable) {
            return null;
        }
    }

    /**
     * Marca uma notificação como lida para o usuário atual.
     * - Pessoal: atualiza read_at na linha.
     * - Broadcast: registra no pivot notification_reads.
     */
    public function markRead(Notification $notification, User $user): void
    {
        if ($notification->isBroadcast()) {
            DB::table('notification_reads')->updateOrInsert(
                ['notification_id' => $notification->id, 'user_id' => $user->id],
                ['read_at' => now()],
            );
            return;
        }

        if ($notification->user_id === $user->id && $notification->read_at === null) {
            $notification->update(['read_at' => now()]);
        }
    }

    /**
     * Marca todas as notificações visíveis (pessoais não lidas + broadcasts não
     * registradas no pivot) como lidas para o usuário atual.
     */
    public function markAllRead(User $user): void
    {
        DB::transaction(function () use ($user) {
            Notification::query()
                ->where('user_id', $user->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);

            $unreadBroadcasts = Notification::query()
                ->where('establishment_id', $user->establishment_id)
                ->whereNull('user_id')
                ->whereDoesntHave('readers', fn ($q) => $q->where('user_id', $user->id))
                ->pluck('id');

            if ($unreadBroadcasts->isNotEmpty()) {
                $rows = $unreadBroadcasts->map(fn ($id) => [
                    'notification_id' => $id,
                    'user_id'         => $user->id,
                    'read_at'         => now(),
                ])->all();

                DB::table('notification_reads')->insert($rows);
            }
        });
    }

    /**
     * Lista paginada para a tela /notifications, com filtros.
     */
    public function forUser(User $user, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        return $this->baseQuery($user)
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->where('type', $v))
            ->when($filters['status'] ?? null, function ($q, $v) use ($user) {
                if ($v === 'unread') {
                    $q->where(function ($q) use ($user) {
                        $q->where(function ($q) use ($user) {
                            $q->whereNotNull('user_id')->whereNull('read_at');
                        })->orWhere(function ($q) use ($user) {
                            $q->whereNull('user_id')->whereDoesntHave(
                                'readers',
                                fn ($q) => $q->where('user_id', $user->id),
                            );
                        });
                    });
                } elseif ($v === 'read') {
                    $q->where(function ($q) use ($user) {
                        $q->where(function ($q) {
                            $q->whereNotNull('user_id')->whereNotNull('read_at');
                        })->orWhere(function ($q) use ($user) {
                            $q->whereNull('user_id')->whereHas(
                                'readers',
                                fn ($q) => $q->where('user_id', $user->id),
                            );
                        });
                    });
                }
            })
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Últimas N notificações (pessoais + broadcast) para o dropdown da topbar.
     */
    public function latestForUser(User $user, int $limit = 10): \Illuminate\Database\Eloquent\Collection
    {
        return $this->baseQuery($user)->latest()->limit($limit)->get();
    }

    /**
     * Contagem de não-lidas — usado pelo badge do sino (polling).
     */
    public function unreadCount(User $user): int
    {
        $personal = Notification::query()
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        $broadcast = Notification::query()
            ->where('establishment_id', $user->establishment_id)
            ->whereNull('user_id')
            ->whereDoesntHave('readers', fn ($q) => $q->where('user_id', $user->id))
            ->count();

        return $personal + $broadcast;
    }

    /**
     * Query base — escopo do estabelecimento + filtro por user_id ∈ {NULL, self}.
     * Ignora o global scope porque queremos incluir broadcast (user_id IS NULL).
     */
    private function baseQuery(User $user)
    {
        return Notification::query()
            ->withoutGlobalScope('establishment')
            ->where('establishment_id', $user->establishment_id)
            ->where(function ($q) use ($user) {
                $q->whereNull('user_id')->orWhere('user_id', $user->id);
            });
    }

    /**
     * Evita criar notificação duplicada se já existe uma não-lida para o mesmo
     * usuário com o mesmo tipo e mesma referência em `data` (ex.: product_id).
     */
    private function hasUnreadDuplicate(string $userId, string $type, array $data, string $establishmentId): bool
    {
        $query = Notification::withoutGlobalScope('establishment')
            ->where('establishment_id', $establishmentId)
            ->where('user_id', $userId)
            ->where('type', $type)
            ->whereNull('read_at');

        foreach ($data as $key => $value) {
            $query->whereJsonContains("data->{$key}", $value);
        }

        return $query->exists();
    }

    private function hasRecentBroadcast(string $establishmentId, string $type, array $data, int $hours): bool
    {
        $query = Notification::withoutGlobalScope('establishment')
            ->where('establishment_id', $establishmentId)
            ->whereNull('user_id')
            ->where('type', $type)
            ->where('created_at', '>=', now()->subHours($hours));

        foreach ($data as $key => $value) {
            $query->whereJsonContains("data->{$key}", $value);
        }

        return $query->exists();
    }
}
