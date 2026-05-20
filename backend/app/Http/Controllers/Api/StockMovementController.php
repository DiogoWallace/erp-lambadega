<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StockMovement\StoreStockMovementRequest;
use App\Http\Resources\StockMovementResource;
use App\Models\Product;
use App\Models\StockMovement;
use App\Services\StockMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class StockMovementController extends Controller
{
    public function __construct(private StockMovementService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        abort_if($request->user()->cannot('stock.view'), 403, 'Sem permissão.');

        $movements = $this->service->paginate(
            $request->only(['product_id', 'type', 'date_from', 'date_to'])
        );

        return StockMovementResource::collection($movements);
    }

    public function store(StoreStockMovementRequest $request): JsonResponse
    {
        abort_if($request->user()->cannot('stock.create'), 403, 'Sem permissão.');

        $product = Product::findOrFail($request->validated()['product_id']);

        try {
            $movement = $this->service->record($product, $request->validated(), $request->user());
        } catch (\DomainException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors'  => ['quantity' => [$e->getMessage()]],
            ], 422);
        }

        return (new StockMovementResource($movement))->response()->setStatusCode(201);
    }

    public function show(Request $request, StockMovement $stockMovement): StockMovementResource
    {
        abort_if($request->user()->cannot('stock.view'), 403, 'Sem permissão.');

        $stockMovement->load(['product:id,name', 'user:id,name']);

        return new StockMovementResource($stockMovement);
    }
}
