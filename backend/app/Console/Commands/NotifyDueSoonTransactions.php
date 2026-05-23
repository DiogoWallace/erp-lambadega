<?php

namespace App\Console\Commands;

use App\Services\FinancialTransactionService;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class NotifyDueSoonTransactions extends Command
{
    protected $signature = 'finance:notify-due-soon {--days=3 : Janela (em dias) a partir de hoje}';

    protected $description = 'Emite broadcast para contas pendentes que vencem nos próximos N dias';

    public function handle(FinancialTransactionService $service, NotificationService $notifications): int
    {
        $days = max(1, (int) $this->option('days'));

        $transactions = $service->dueWithin($days);
        $count = 0;

        foreach ($transactions as $transaction) {
            $isPayable = $transaction->type === 'expense';
            $amount    = 'R$ ' . number_format((float) $transaction->amount, 2, ',', '.');
            $label     = $isPayable ? 'Conta a pagar próxima do vencimento' : 'Conta a receber próxima do vencimento';

            $created = $notifications->createBroadcast(
                establishmentId: $transaction->establishment_id,
                type:            'finance.due_soon',
                title:           "{$label}: {$amount}",
                severity:        'warning',
                body:            "{$transaction->description} vence em "
                                  . $transaction->due_date->format('d/m/Y') . '.',
                actionUrl:       "/finance/{$transaction->id}/edit",
                data:            ['transaction_id' => $transaction->id],
            );

            if ($created) {
                $count++;
            }
        }

        $this->info("{$count} notificação(ões) de vencimento emitida(s) (janela: {$days} dia(s)).");

        return self::SUCCESS;
    }
}
