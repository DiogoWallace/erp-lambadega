<?php

namespace App\Listeners;

use App\Events\OrderPaid;
use App\Models\FinancialTransaction;

/**
 * Gera as contas a receber (uma por parcela) quando uma venda é paga.
 *
 * Síncrono de propósito: roda no contexto do request, onde o tenant está
 * disponível. NÃO marcar como ShouldQueue antes de propagar o establishment_id
 * para os jobs — o global scope multi-tenant depende de auth() (ver
 * BelongsToEstablishment).
 */
class GenerateFinancialTransactions
{
    public function handle(OrderPaid $event): void
    {
        $order         = $event->order;
        $paymentMethod = $event->paymentMethod;
        $installments  = $event->installments;

        $perInstallment = round((float) $order->total_amount / $installments, 2);

        for ($i = 1; $i <= $installments; $i++) {
            $isLast = $i === $installments;
            $amount = $isLast
                ? round((float) $order->total_amount - ($perInstallment * ($installments - 1)), 2)
                : $perInstallment;

            FinancialTransaction::create([
                'establishment_id'   => $order->establishment_id,
                'order_id'           => $order->id,
                'user_id'            => $order->user_id,
                'customer_id'        => $order->customer_id,
                'type'               => 'income',
                'category'           => 'sales',
                'description'        => "Venda {$order->order_number}"
                    . ($installments > 1 ? " ({$i}/{$installments})" : ''),
                'amount'             => $amount,
                'payment_method'     => $paymentMethod,
                'due_date'           => now()->addMonths($i - 1)->toDateString(),
                'payment_date'       => $installments === 1 ? now()->toDateString() : null,
                'status'             => $installments === 1 ? 'paid' : 'pending',
                'installment_number' => $installments > 1 ? $i : null,
                'installment_count'  => $installments > 1 ? $installments : null,
            ]);
        }
    }
}
