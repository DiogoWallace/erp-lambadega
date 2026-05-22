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

        $data = $this->service->metrics($period, $dateFrom, $dateTo);

        return response()->json(['data' => $data]);
    }
}
