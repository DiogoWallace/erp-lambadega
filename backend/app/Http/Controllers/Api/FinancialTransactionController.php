<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FinancialTransaction\PayFinancialTransactionRequest;
use App\Http\Requests\FinancialTransaction\StoreFinancialTransactionRequest;
use App\Http\Requests\FinancialTransaction\UpdateFinancialTransactionRequest;
use App\Http\Resources\FinancialTransactionResource;
use App\Models\FinancialTransaction;
use App\Services\FinancialTransactionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FinancialTransactionController extends Controller
{
    public function __construct(private FinancialTransactionService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', FinancialTransaction::class);

        $transactions = $this->service->paginate($request->only([
            'type', 'status', 'category', 'customer_id', 'supplier_id', 'due_from', 'due_to', 'search',
        ]));

        return FinancialTransactionResource::collection($transactions);
    }

    public function store(StoreFinancialTransactionRequest $request): JsonResponse
    {
        $this->authorize('create', FinancialTransaction::class);

        $transaction = $this->service->create($request->validated());

        return (new FinancialTransactionResource($transaction))->response()->setStatusCode(201);
    }

    public function show(FinancialTransaction $financialTransaction): FinancialTransactionResource
    {
        $this->authorize('view', $financialTransaction);

        $financialTransaction->load(['order:id,order_number', 'customer:id,name', 'supplier:id,company_name']);

        return new FinancialTransactionResource($financialTransaction);
    }

    public function update(UpdateFinancialTransactionRequest $request, FinancialTransaction $financialTransaction): FinancialTransactionResource
    {
        $this->authorize('update', $financialTransaction);

        $transaction = $this->service->update($financialTransaction, $request->validated());

        return new FinancialTransactionResource($transaction);
    }

    public function destroy(FinancialTransaction $financialTransaction): JsonResponse
    {
        $this->authorize('delete', $financialTransaction);

        $this->service->delete($financialTransaction);

        return response()->json(null, 204);
    }

    public function pay(PayFinancialTransactionRequest $request, FinancialTransaction $financialTransaction): FinancialTransactionResource
    {
        $this->authorize('update', $financialTransaction);

        $transaction = $this->service->markAsPaid(
            $financialTransaction,
            $request->validated('payment_date'),
            $request->validated('payment_method'),
        );

        return new FinancialTransactionResource($transaction);
    }
}
