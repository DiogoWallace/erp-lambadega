<?php

namespace App\Console\Commands;

use App\Services\FinancialTransactionService;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class MarkOverdueTransactions extends Command
{
    protected $signature = 'finance:mark-overdue';

    protected $description = 'Marca como vencidas (overdue) as contas pendentes com vencimento no passado';

    public function handle(FinancialTransactionService $service, NotificationService $notifications): int
    {
        $transactions = $service->markOverdue();

        foreach ($transactions as $transaction) {
            $isPayable = $transaction->type === 'expense';
            $amount    = 'R$ ' . number_format((float) $transaction->amount, 2, ',', '.');
            $label     = $isPayable ? 'Conta a pagar vencida' : 'Conta a receber vencida';

            $notifications->createBroadcast(
                establishmentId: $transaction->establishment_id,
                type:            'finance.overdue',
                title:           "{$label}: {$amount}",
                severity:        'critical',
                body:            "{$transaction->description} venceu em "
                                  . $transaction->due_date->format('d/m/Y') . '.',
                actionUrl:       "/finance/{$transaction->id}/edit",
                data:            ['transaction_id' => $transaction->id],
            );
        }

        $count = count($transactions);
        $this->info("{$count} transação(ões) marcada(s) como vencida(s).");

        return self::SUCCESS;
    }
}
