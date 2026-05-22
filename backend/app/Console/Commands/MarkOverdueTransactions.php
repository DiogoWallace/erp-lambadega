<?php

namespace App\Console\Commands;

use App\Services\FinancialTransactionService;
use Illuminate\Console\Command;

class MarkOverdueTransactions extends Command
{
    protected $signature = 'finance:mark-overdue';

    protected $description = 'Marca como vencidas (overdue) as contas pendentes com vencimento no passado';

    public function handle(FinancialTransactionService $service): int
    {
        $count = $service->markOverdue();

        $this->info("{$count} transação(ões) marcada(s) como vencida(s).");

        return self::SUCCESS;
    }
}
