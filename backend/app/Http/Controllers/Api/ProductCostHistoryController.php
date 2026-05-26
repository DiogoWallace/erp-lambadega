<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductCostHistory\StoreProductCostHistoryRequest;
use App\Http\Resources\ProductCostHistoryResource;
use App\Models\Product;
use App\Services\ProductCostHistoryService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductCostHistoryController extends Controller
{
    public function __construct(private ProductCostHistoryService $service) {}

    public function index(Request $request, Product $product): AnonymousResourceCollection
    {
        $this->authorize('viewAny', [\App\Models\ProductCostHistory::class, $product]);

        return ProductCostHistoryResource::collection(
            $this->service->paginate($product, $request->only(['supplier_id', 'source', 'date_from', 'date_to']))
        );
    }

    public function store(StoreProductCostHistoryRequest $request, Product $product): ProductCostHistoryResource
    {
        $this->authorize('create', [\App\Models\ProductCostHistory::class, $product]);

        $entry = $this->service->recordQuote($product, $request->user(), $request->validated());

        return new ProductCostHistoryResource($entry->load(['supplier:id,company_name', 'user:id,name']));
    }
}
