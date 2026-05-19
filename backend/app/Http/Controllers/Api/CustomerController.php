<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Models\Customer;
use App\Services\CustomerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CustomerController extends Controller
{
    public function __construct(private CustomerService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        abort_if($request->user()->cannot('customers.view'), 403, 'Sem permissão.');

        $customers = $this->service->paginate($request->only(['search', 'is_active']));

        return CustomerResource::collection($customers);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        abort_if($request->user()->cannot('customers.create'), 403, 'Sem permissão.');

        $customer = $this->service->create($request->validated());

        return (new CustomerResource($customer))->response()->setStatusCode(201);
    }

    public function show(Request $request, Customer $customer): CustomerResource
    {
        abort_if($request->user()->cannot('customers.view'), 403, 'Sem permissão.');

        return new CustomerResource($customer);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): CustomerResource
    {
        abort_if($request->user()->cannot('customers.edit'), 403, 'Sem permissão.');

        $customer = $this->service->update($customer, $request->validated());

        return new CustomerResource($customer);
    }

    public function destroy(Request $request, Customer $customer): JsonResponse
    {
        abort_if($request->user()->cannot('customers.delete'), 403, 'Sem permissão.');

        $this->service->delete($customer);

        return response()->json(null, 204);
    }
}
