<?php

namespace App\Services;

use App\Models\FinancialTransaction;
use App\Models\Order;
use App\Models\OrderItem;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Leitura-apenas. Agrega dados de Order/OrderItem/FinancialTransaction
 * para os relatórios. Nunca escreve — escritas continuam exclusivas dos
 * services donos (OrderService, FinancialTransactionService).
 */
class ReportService
{
    public function salesByPeriod(array $filters): array
    {
        [$from, $to] = $this->resolveDateRange($filters);

        $orders = Order::query()
            ->with(['customer:id,name', 'user:id,name'])
            ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['payment_method'] ?? null, fn ($q, $v) => $q->where('payment_method', $v))
            ->orderByDesc('created_at')
            ->get();

        $paid = $orders->where('status', 'paid');
        $revenue = (float) $paid->sum('total_amount');
        $paidCount = $paid->count();

        $byStatus = $orders->groupBy('status')->map(fn ($g) => [
            'count' => $g->count(),
            'total' => (float) $g->sum('total_amount'),
        ]);

        $byDay = $orders->groupBy(fn ($o) => $o->created_at->toDateString())
            ->map(fn ($g) => [
                'count'   => $g->count(),
                'revenue' => (float) $g->where('status', 'paid')->sum('total_amount'),
            ])
            ->sortKeys();

        $byPaymentMethod = $paid->groupBy(fn ($o) => $o->payment_method ?? 'unknown')
            ->map(fn ($g) => [
                'count' => $g->count(),
                'total' => (float) $g->sum('total_amount'),
            ]);

        return [
            'period'  => $this->periodMeta($from, $to),
            'totals'  => [
                'orders'     => $orders->count(),
                'paid'       => $paidCount,
                'pending'    => $orders->where('status', 'pending')->count(),
                'canceled'   => $orders->where('status', 'canceled')->count(),
                'revenue'    => round($revenue, 2),
                'avg_ticket' => $paidCount > 0 ? round($revenue / $paidCount, 2) : 0,
            ],
            'by_status'         => $byStatus,
            'by_day'            => $byDay,
            'by_payment_method' => $byPaymentMethod,
            'orders'            => $orders->map(fn ($o) => [
                'id'             => $o->id,
                'order_number'   => $o->order_number,
                'status'         => $o->status,
                'payment_method' => $o->payment_method,
                'subtotal'       => (float) $o->subtotal_amount,
                'discount'       => (float) $o->discount_amount,
                'total'          => (float) $o->total_amount,
                'customer'       => $o->customer?->name,
                'user'           => $o->user?->name,
                'created_at'     => $o->created_at?->toIso8601String(),
                'paid_at'        => $o->paid_at?->toIso8601String(),
            ])->values(),
        ];
    }

    public function topProducts(array $filters): array
    {
        [$from, $to] = $this->resolveDateRange($filters);
        $limit = (int) ($filters['limit'] ?? 20);

        $rows = OrderItem::query()
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->where('orders.status', 'paid')
            ->whereBetween('orders.created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->selectRaw('
                order_items.product_id as product_id,
                products.name as product_name,
                products.sku as sku,
                SUM(order_items.quantity) as total_quantity,
                SUM(order_items.total_price) as total_revenue,
                COUNT(DISTINCT order_items.order_id) as orders_count
            ')
            ->groupBy('order_items.product_id', 'products.name', 'products.sku')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        $items = $rows->map(fn ($r) => [
            'product_id'    => $r->product_id,
            'product_name'  => $r->product_name,
            'sku'           => $r->sku,
            'quantity'      => (int) $r->total_quantity,
            'revenue'       => round((float) $r->total_revenue, 2),
            'orders_count'  => (int) $r->orders_count,
            'avg_per_order' => $r->orders_count > 0
                ? round((float) $r->total_revenue / (int) $r->orders_count, 2)
                : 0,
        ])->values();

        return [
            'period' => $this->periodMeta($from, $to),
            'totals' => [
                'products'      => $items->count(),
                'quantity_sold' => $items->sum('quantity'),
                'revenue'       => round($items->sum('revenue'), 2),
            ],
            'items' => $items,
        ];
    }

    public function cashFlow(array $filters): array
    {
        [$from, $to] = $this->resolveDateRange($filters);

        $transactions = FinancialTransaction::query()
            ->whereBetween('due_date', [$from->toDateString(), $to->toDateString()])
            ->get(['id', 'type', 'status', 'amount', 'due_date', 'payment_date', 'description']);

        $byDay = $this->buildDailyCashFlow($from, $to, $transactions);

        $incomeRealized  = (float) $transactions->where('type', 'income')->where('status', 'paid')->sum('amount');
        $expenseRealized = (float) $transactions->where('type', 'expense')->where('status', 'paid')->sum('amount');
        $incomePending   = (float) $transactions->where('type', 'income')->whereIn('status', ['pending', 'overdue'])->sum('amount');
        $expensePending  = (float) $transactions->where('type', 'expense')->whereIn('status', ['pending', 'overdue'])->sum('amount');

        return [
            'period'  => $this->periodMeta($from, $to),
            'totals'  => [
                'income_realized'  => round($incomeRealized, 2),
                'expense_realized' => round($expenseRealized, 2),
                'net_realized'     => round($incomeRealized - $expenseRealized, 2),
                'income_pending'   => round($incomePending, 2),
                'expense_pending'  => round($expensePending, 2),
                'net_projected'    => round(($incomeRealized + $incomePending) - ($expenseRealized + $expensePending), 2),
            ],
            'by_day' => $byDay,
        ];
    }

    public function accountsStatus(array $filters): array
    {
        $type = $filters['type'] ?? null;

        $transactions = FinancialTransaction::query()
            ->with(['customer:id,name', 'supplier:id,company_name', 'order:id,order_number'])
            ->when($type, fn ($q, $v) => $q->where('type', $v))
            ->when($filters['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($filters['due_from'] ?? null, fn ($q, $v) => $q->whereDate('due_date', '>=', $v))
            ->when($filters['due_to'] ?? null, fn ($q, $v) => $q->whereDate('due_date', '<=', $v))
            ->orderBy('due_date')
            ->get();

        $byStatus = $transactions->groupBy('status')->map(fn ($g) => [
            'count' => $g->count(),
            'total' => round((float) $g->sum('amount'), 2),
        ]);

        $byCategory = $transactions->groupBy(fn ($t) => $t->category ?? 'uncategorized')
            ->map(fn ($g) => [
                'count' => $g->count(),
                'total' => round((float) $g->sum('amount'), 2),
            ]);

        return [
            'filters' => [
                'type'     => $type,
                'status'   => $filters['status'] ?? null,
                'due_from' => $filters['due_from'] ?? null,
                'due_to'   => $filters['due_to'] ?? null,
            ],
            'totals' => [
                'count'   => $transactions->count(),
                'amount'  => round((float) $transactions->sum('amount'), 2),
                'overdue' => $transactions->where('status', 'overdue')->count(),
            ],
            'by_status'   => $byStatus,
            'by_category' => $byCategory,
            'items'       => $transactions->map(fn ($t) => [
                'id'             => $t->id,
                'type'           => $t->type,
                'status'         => $t->status,
                'category'       => $t->category,
                'description'    => $t->description,
                'amount'         => (float) $t->amount,
                'due_date'       => $t->due_date?->toDateString(),
                'payment_date'   => $t->payment_date?->toDateString(),
                'payment_method' => $t->payment_method,
                'customer'       => $t->customer?->name,
                'supplier'       => $t->supplier?->company_name,
                'order_number'   => $t->order?->order_number,
            ])->values(),
        ];
    }

    private function buildDailyCashFlow(Carbon $from, Carbon $to, Collection $transactions): Collection
    {
        $running = 0.0;
        $days = collect();

        for ($d = $from->copy(); $d->lte($to); $d->addDay()) {
            $key = $d->toDateString();
            $dayTx = $transactions->filter(fn ($t) => $t->due_date?->toDateString() === $key);

            $incomePaid    = (float) $dayTx->where('type', 'income')->where('status', 'paid')->sum('amount');
            $expensePaid   = (float) $dayTx->where('type', 'expense')->where('status', 'paid')->sum('amount');
            $incomeOpen    = (float) $dayTx->where('type', 'income')->whereIn('status', ['pending', 'overdue'])->sum('amount');
            $expenseOpen   = (float) $dayTx->where('type', 'expense')->whereIn('status', ['pending', 'overdue'])->sum('amount');

            $netRealized = $incomePaid - $expensePaid;
            $running += $netRealized;

            $days->push([
                'date'             => $key,
                'income_realized'  => round($incomePaid, 2),
                'expense_realized' => round($expensePaid, 2),
                'income_pending'   => round($incomeOpen, 2),
                'expense_pending'  => round($expenseOpen, 2),
                'net'              => round($netRealized, 2),
                'running_balance'  => round($running, 2),
            ]);
        }

        return $days;
    }

    private function resolveDateRange(array $filters): array
    {
        $now = Carbon::now();
        $from = isset($filters['date_from'])
            ? Carbon::parse($filters['date_from'])
            : $now->copy()->startOfMonth();
        $to = isset($filters['date_to'])
            ? Carbon::parse($filters['date_to'])
            : $now->copy()->endOfMonth();

        if ($to->lt($from)) {
            [$from, $to] = [$to, $from];
        }

        return [$from, $to];
    }

    private function periodMeta(Carbon $from, Carbon $to): array
    {
        return [
            'date_from' => $from->toDateString(),
            'date_to'   => $to->toDateString(),
        ];
    }
}
