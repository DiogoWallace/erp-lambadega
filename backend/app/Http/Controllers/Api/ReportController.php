<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(private ReportService $service) {}

    public function sales(Request $request): JsonResponse|StreamedResponse
    {
        $this->authorize('reports.view');

        $data = $this->service->salesByPeriod($request->only([
            'date_from', 'date_to', 'status', 'payment_method',
        ]));

        if ($request->input('format') === 'csv') {
            return $this->csv('sales', [
                'Pedido', 'Status', 'Pagamento', 'Subtotal', 'Desconto', 'Total',
                'Cliente', 'Vendedor', 'Criado em', 'Pago em',
            ], $data['orders'], fn ($o) => [
                $o['order_number'], $o['status'], $o['payment_method'] ?? '',
                $o['subtotal'], $o['discount'], $o['total'],
                $o['customer'] ?? '', $o['user'] ?? '',
                $o['created_at'] ?? '', $o['paid_at'] ?? '',
            ]);
        }

        return response()->json(['data' => $data]);
    }

    public function topProducts(Request $request): JsonResponse|StreamedResponse
    {
        $this->authorize('reports.view');

        $data = $this->service->topProducts($request->only([
            'date_from', 'date_to', 'limit',
        ]));

        if ($request->input('format') === 'csv') {
            return $this->csv('top-products', [
                'Produto', 'SKU', 'Quantidade', 'Receita', 'Pedidos', 'Receita média/pedido',
            ], $data['items'], fn ($i) => [
                $i['product_name'], $i['sku'] ?? '',
                $i['quantity'], $i['revenue'], $i['orders_count'], $i['avg_per_order'],
            ]);
        }

        return response()->json(['data' => $data]);
    }

    public function cashFlow(Request $request): JsonResponse|StreamedResponse
    {
        $this->authorize('reports.view');

        $data = $this->service->cashFlow($request->only(['date_from', 'date_to']));

        if ($request->input('format') === 'csv') {
            return $this->csv('cash-flow', [
                'Data', 'Entradas realizadas', 'Saídas realizadas',
                'Entradas pendentes', 'Saídas pendentes', 'Líquido do dia', 'Saldo acumulado',
            ], $data['by_day'], fn ($d) => [
                $d['date'], $d['income_realized'], $d['expense_realized'],
                $d['income_pending'], $d['expense_pending'], $d['net'], $d['running_balance'],
            ]);
        }

        return response()->json(['data' => $data]);
    }

    public function accounts(Request $request): JsonResponse|StreamedResponse
    {
        $this->authorize('reports.view');

        $data = $this->service->accountsStatus($request->only([
            'type', 'status', 'due_from', 'due_to',
        ]));

        if ($request->input('format') === 'csv') {
            return $this->csv('accounts', [
                'Tipo', 'Status', 'Categoria', 'Descrição', 'Valor',
                'Vencimento', 'Pagamento', 'Método', 'Cliente', 'Fornecedor', 'Pedido',
            ], $data['items'], fn ($t) => [
                $t['type'], $t['status'], $t['category'] ?? '', $t['description'],
                $t['amount'], $t['due_date'] ?? '', $t['payment_date'] ?? '',
                $t['payment_method'] ?? '', $t['customer'] ?? '',
                $t['supplier'] ?? '', $t['order_number'] ?? '',
            ]);
        }

        return response()->json(['data' => $data]);
    }

    private function csv(string $name, array $headers, iterable $rows, callable $row): StreamedResponse
    {
        $filename = "{$name}-" . now()->format('Y-m-d-His') . '.csv';

        return response()->streamDownload(function () use ($headers, $rows, $row) {
            $out = fopen('php://output', 'w');
            // BOM para Excel renderizar UTF-8 corretamente
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, $headers);
            foreach ($rows as $r) {
                fputcsv($out, $row($r));
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
