<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Supplier\StoreSupplierRequest;
use App\Http\Requests\Supplier\UpdateSupplierRequest;
use App\Http\Resources\SupplierResource;
use App\Models\Supplier;
use App\Services\SupplierService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SupplierController extends Controller
{
    public function __construct(private SupplierService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        abort_if($request->user()->cannot('suppliers.view'), 403, 'Sem permissão.');

        $suppliers = $this->service->paginate($request->only(['search', 'is_active']));

        return SupplierResource::collection($suppliers);
    }

    public function store(StoreSupplierRequest $request): JsonResponse
    {
        abort_if($request->user()->cannot('suppliers.create'), 403, 'Sem permissão.');

        $supplier = $this->service->create($request->validated());

        return (new SupplierResource($supplier))->response()->setStatusCode(201);
    }

    public function show(Request $request, Supplier $supplier): SupplierResource
    {
        abort_if($request->user()->cannot('suppliers.view'), 403, 'Sem permissão.');

        return new SupplierResource($supplier);
    }

    public function update(UpdateSupplierRequest $request, Supplier $supplier): SupplierResource
    {
        abort_if($request->user()->cannot('suppliers.edit'), 403, 'Sem permissão.');

        $supplier = $this->service->update($supplier, $request->validated());

        return new SupplierResource($supplier);
    }

    public function destroy(Request $request, Supplier $supplier): JsonResponse
    {
        abort_if($request->user()->cannot('suppliers.delete'), 403, 'Sem permissão.');

        $this->service->delete($supplier);

        return response()->json(null, 204);
    }
}
