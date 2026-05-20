<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(private ProductService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        abort_if($request->user()->cannot('products.view'), 403, 'Sem permissão.');

        if ($request->boolean('all')) {
            return ProductResource::collection($this->service->all());
        }

        $products = $this->service->paginate(
            $request->only(['search', 'category_id', 'supplier_id', 'is_active', 'low_stock'])
        );

        return ProductResource::collection($products);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        abort_if($request->user()->cannot('products.create'), 403, 'Sem permissão.');

        $product = $this->service->create($request->validated());

        return (new ProductResource($product))->response()->setStatusCode(201);
    }

    public function show(Request $request, Product $product): ProductResource
    {
        abort_if($request->user()->cannot('products.view'), 403, 'Sem permissão.');

        $product->load(['category:id,name', 'supplier:id,company_name']);

        return new ProductResource($product);
    }

    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        abort_if($request->user()->cannot('products.edit'), 403, 'Sem permissão.');

        $product = $this->service->update($product, $request->validated());

        return new ProductResource($product);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        abort_if($request->user()->cannot('products.delete'), 403, 'Sem permissão.');

        $this->service->delete($product);

        return response()->json(null, 204);
    }
}
