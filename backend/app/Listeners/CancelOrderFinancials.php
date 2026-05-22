<?php

namespace App\Listeners;

use App\Events\OrderCancelled;
use App\Services\FinancialTransactionService;

/**
 * Cancela as contas a receber pendentes de uma venda cancelada, delegando ao
 * FinancialTransactionService.
 *
 * Hoje é efetivamente um no-op: cancel() só aceita pedidos `pending`, que ainda
 * não geraram FinancialTransaction (essas nascem no pagamento). Mantido como
 * seam para quando existir estorno de pedido pago (refund). Ver memória
 * project-sales-refactor.
 */
class CancelOrderFinancials
{
    public function __construct(private FinancialTransactionService $service) {}

    public function handle(OrderCancelled $event): void
    {
        $this->service->cancelForOrder($event->order->id);
    }
}
