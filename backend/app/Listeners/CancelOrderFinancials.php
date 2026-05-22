<?php

namespace App\Listeners;

use App\Events\OrderCancelled;
use App\Models\FinancialTransaction;

/**
 * Marca como canceladas as contas a receber pendentes de uma venda cancelada.
 *
 * Hoje é efetivamente um no-op: cancel() só aceita pedidos `pending`, que ainda
 * não geraram FinancialTransaction (essas nascem no pagamento). Mantido como
 * seam para quando existir estorno de pedido pago (refund). Ver memória
 * project-sales-refactor.
 */
class CancelOrderFinancials
{
    public function handle(OrderCancelled $event): void
    {
        FinancialTransaction::where('order_id', $event->order->id)
            ->where('status', 'pending')
            ->update(['status' => 'canceled']);
    }
}
