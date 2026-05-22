<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Services\FinancialTransactionService;

/**
 * Gera as contas a receber quando uma venda é paga, delegando ao
 * FinancialTransactionService (dono das escritas de FinancialTransaction).
 *
 * Síncrono de propósito: roda no contexto do request, onde o tenant está
 * disponível. NÃO marcar como ShouldQueue antes de propagar o establishment_id
 * para os jobs — o global scope multi-tenant depende de auth() (ver
 * BelongsToEstablishment e docs/arquitetura/vendas-eventos.md).
 */
class GenerateFinancialTransactions
{
    public function __construct(private FinancialTransactionService $service) {}

    public function handle(OrderPaid $event): void
    {
        $this->service->recordForOrder(
            $event->order,
            $event->paymentMethod,
            $event->installments,
        );
    }
}
