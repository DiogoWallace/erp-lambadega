<?php

namespace App\Http\Controllers;

use App\Http\Requests\Customer\StoreCustomerRequest;
use App\Http\Requests\Customer\UpdateCustomerRequest;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_if($request->user()->cannot('customers.view'), 403, 'Sem permissão.');

        $query = Customer::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('document', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active') && $request->is_active !== '') {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $paginator = $query->orderBy('name')->paginate(15);

        return response()->json([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        abort_if($request->user()->cannot('customers.create'), 403, 'Sem permissão.');

        $customer = Customer::create($request->validated());

        return response()->json(['data' => $customer], 201);
    }

    public function show(Request $request, Customer $customer): JsonResponse
    {
        abort_if($request->user()->cannot('customers.view'), 403, 'Sem permissão.');

        return response()->json(['data' => $customer]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        abort_if($request->user()->cannot('customers.edit'), 403, 'Sem permissão.');

        $customer->update($request->validated());

        return response()->json(['data' => $customer->fresh()]);
    }

    public function destroy(Request $request, Customer $customer): JsonResponse
    {
        abort_if($request->user()->cannot('customers.delete'), 403, 'Sem permissão.');

        $customer->delete();

        return response()->json(null, 204);
    }
}
