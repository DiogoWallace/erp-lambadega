<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;

class DashboardService
{
    public function metrics(string $period = 'month', ?string $dateFrom = null, ?string $dateTo = null): array
    {
        [$currentFrom, $currentTo, $previousFrom, $previousTo, $label] = $this->resolvePeriod(
            $period, $dateFrom, $dateTo
        );

        $currentOrders  = $this->queryOrders($currentFrom, $currentTo);
        $previousOrders = $previousFrom ? $this->queryOrders($previousFrom, $previousTo) : null;

        $currentRevenue  = $currentOrders->where('status', 'paid')->sum('total_amount');
        $previousRevenue = $previousOrders ? $previousOrders->where('status', 'paid')->sum('total_amount') : null;

        $currentPaid    = $currentOrders->where('status', 'paid')->count();
        $previousPaid   = $previousOrders ? $previousOrders->where('status', 'paid')->count() : null;

        $avgTicket = $currentPaid > 0 ? round($currentRevenue / $currentPaid, 2) : 0;

        $lowStock = Product::query()
            ->whereColumn('stock_quantity', '<=', 'min_stock_quantity')
            ->where('is_active', true)
            ->orderBy('stock_quantity')
            ->limit(10)
            ->get(['id', 'name', 'sku', 'stock_quantity', 'min_stock_quantity', 'unit']);

        $recentOrders = Order::with(['customer:id,name', 'user:id,name'])
            ->latest()
            ->limit(8)
            ->get(['id', 'order_number', 'status', 'total_amount', 'customer_id', 'user_id', 'created_at']);

        return [
            'period' => [
                'key'       => $period,
                'label'     => $label,
                'date_from' => $currentFrom->toDateString(),
                'date_to'   => $currentTo->toDateString(),
            ],
            'revenue' => [
                'current'        => number_format((float) $currentRevenue, 2, '.', ''),
                'previous'       => $previousRevenue !== null ? number_format((float) $previousRevenue, 2, '.', '') : null,
                'change_percent' => $this->changePercent($previousRevenue, $currentRevenue),
            ],
            'orders' => [
                'total'          => $currentOrders->count(),
                'paid'           => $currentPaid,
                'pending'        => $currentOrders->where('status', 'pending')->count(),
                'canceled'       => $currentOrders->where('status', 'canceled')->count(),
                'previous_paid'  => $previousPaid,
                'change_percent' => $this->changePercent($previousPaid, $currentPaid),
            ],
            'avg_ticket' => [
                'current'        => number_format($avgTicket, 2, '.', ''),
                'change_percent' => null,
            ],
            'low_stock_count' => $lowStock->count(),
            'low_stock'       => $lowStock->map(fn ($p) => [
                'id'                => $p->id,
                'name'              => $p->name,
                'sku'               => $p->sku,
                'stock_quantity'    => $p->stock_quantity,
                'min_stock_quantity'=> $p->min_stock_quantity,
                'unit'              => $p->unit,
            ])->values(),
            'recent_orders' => $recentOrders->map(fn ($o) => [
                'id'           => $o->id,
                'order_number' => $o->order_number,
                'status'       => $o->status,
                'total_amount' => $o->total_amount,
                'customer'     => $o->customer ? ['id' => $o->customer->id, 'name' => $o->customer->name] : null,
                'user'         => $o->user ? ['id' => $o->user->id, 'name' => $o->user->name] : null,
                'created_at'   => $o->created_at,
            ])->values(),
        ];
    }

    private function queryOrders(Carbon $from, Carbon $to)
    {
        return Order::whereBetween('created_at', [
            $from->copy()->startOfDay(),
            $to->copy()->endOfDay(),
        ])->get(['id', 'status', 'total_amount']);
    }

    private function resolvePeriod(string $period, ?string $dateFrom, ?string $dateTo): array
    {
        $now = Carbon::now();

        return match ($period) {
            'today' => [
                $now->copy()->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDay()->startOfDay(),
                $now->copy()->subDay()->endOfDay(),
                'Hoje',
            ],
            'week' => [
                $now->copy()->startOfWeek(),
                $now->copy()->endOfWeek(),
                $now->copy()->subWeek()->startOfWeek(),
                $now->copy()->subWeek()->endOfWeek(),
                'Esta semana',
            ],
            'custom' => [
                Carbon::parse($dateFrom ?? $now->toDateString()),
                Carbon::parse($dateTo ?? $now->toDateString()),
                null,
                null,
                'Período personalizado',
            ],
            default => [ // month
                $now->copy()->startOfMonth(),
                $now->copy()->endOfMonth(),
                $now->copy()->subMonth()->startOfMonth(),
                $now->copy()->subMonth()->endOfMonth(),
                'Este mês',
            ],
        };
    }

    private function changePercent(float|int|null $previous, float|int $current): ?float
    {
        if ($previous === null) return null;
        if ($previous == 0) return $current > 0 ? 100.0 : null;
        return round((($current - $previous) / $previous) * 100, 1);
    }
}
