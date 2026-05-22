<?php

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Dono único das escritas de FinancialTransaction. CRUD manual de contas a
 * pagar/receber + geração/cancelamento a partir de vendas (chamado pelos
 * listeners de OrderPaid/OrderCancelled).
 */
class FinancialTransactionService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        return FinancialTransaction::query()
            ->with(['order:id,order_number', 'customer:id,name', 'supplier:id,company_name'])
            ->when($filters['type'] ?? null, fn ($q, $v) => $q->where('type', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['category'] ?? null, fn ($q, $v) => $q->where('category', $v))
            ->when($filters['customer_id'] ?? null, fn ($q, $v) => $q->where('customer_id', $v))
            ->when($filters['supplier_id'] ?? null, fn ($q, $v) => $q->where('supplier_id', $v))
            ->when($filters['due_from'] ?? null, fn ($q, $v) => $q->whereDate('due_date', '>=', $v))
            ->when($filters['due_to'] ?? null, fn ($q, $v) => $q->whereDate('due_date', '<=', $v))
            ->when($filters['search'] ?? null, fn ($q, $v) => $q->where('description', 'like', "%{$v}%"))
            ->orderBy('due_date')
            ->paginate(20);
    }

    public function find(string $id): FinancialTransaction
    {
        return FinancialTransaction::with([
            'order:id,order_number', 'customer:id,name', 'supplier:id,company_name',
        ])->findOrFail($id);
    }

    public function create(array $data): FinancialTransaction
    {
        $transaction = FinancialTransaction::create([
            'user_id' => auth()->id(),
            ...$data,
        ]);

        return $this->find($transaction->id);
    }

    public function update(FinancialTransaction $transaction, array $data): FinancialTransaction
    {
        $transaction->update($data);

        return $this->find($transaction->id);
    }

    public function delete(FinancialTransaction $transaction): void
    {
        $transaction->delete();
    }

    /**
     * Baixa manual: marca como paga, registra a data e o método.
     */
    public function markAsPaid(FinancialTransaction $transaction, ?string $paymentDate = null, ?string $paymentMethod = null): FinancialTransaction
    {
        $transaction->update([
            'status'         => 'paid',
            'payment_date'   => $paymentDate ?? now()->toDateString(),
            'payment_method' => $paymentMethod ?? $transaction->payment_method,
        ]);

        return $this->find($transaction->id);
    }

    /**
     * Gera as contas a receber (uma por parcela) de uma venda paga.
     * Chamado pelo listener GenerateFinancialTransactions.
     */
    public function recordForOrder(Order $order, string $paymentMethod, int $installments = 1): void
    {
        DB::transaction(function () use ($order, $paymentMethod, $installments) {
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
        });
    }

    /**
     * Cancela as contas a receber pendentes de uma venda cancelada.
     * Chamado pelo listener CancelOrderFinancials.
     */
    public function cancelForOrder(string $orderId): void
    {
        FinancialTransaction::where('order_id', $orderId)
            ->where('status', 'pending')
            ->update(['status' => 'canceled']);
    }

    /**
     * Marca como vencidas as contas pendentes com vencimento no passado.
     * Manutenção de sistema (roda sem auth, via comando agendado), por isso
     * ignora o escopo de tenant de propósito — processa todos os estabelecimentos.
     *
     * @return int quantidade de transações atualizadas
     */
    public function markOverdue(): int
    {
        return FinancialTransaction::withoutGlobalScope('establishment')
            ->where('status', 'pending')
            ->whereDate('due_date', '<', now()->toDateString())
            ->update(['status' => 'overdue']);
    }
}
