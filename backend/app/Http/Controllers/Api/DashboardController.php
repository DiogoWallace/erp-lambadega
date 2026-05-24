<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private DashboardService $service) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('dashboard.view');

        $period   = $request->input('period', 'month');
        $dateFrom = $request->input('date_from');
        $dateTo   = $request->input('date_to');

        // Quem tem `dashboard.view_all` (admin/gerente/financeiro) vê números
        // do estabelecimento inteiro. Os demais (vendedor) só veem os próprios.
        $forUserId = $request->user()->can('dashboard.view_all')
            ? null
            : $request->user()->id;

        $data = $this->service->metrics($period, $dateFrom, $dateTo, $forUserId);

        return response()->json(['data' => $data]);
    }
}
