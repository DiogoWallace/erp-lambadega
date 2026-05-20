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
        $this->authorize('viewAny', StockMovement::class);

        $movements = $this->service->paginate(
            $request->only(['product_id', 'type', 'date_from', 'date_to'])
        );

        return StockMovementResource::collection($movements);
    }

    public function store(StoreStockMovementRequest $request): JsonResponse
    {
        $this->authorize('create', StockMovement::class);

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
        $this->authorize('view', $stockMovement);

        $stockMovement->load(['product:id,name', 'user:id,name']);

        return new StockMovementResource($stockMovement);
    }
}
