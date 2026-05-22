<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\PayOrderRequest;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private OrderService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Order::class);

        $orders = $this->service->paginate(
            $request->only(['status', 'customer_id', 'date_from', 'date_to', 'search'])
        );

        return OrderResource::collection($orders);
    }

    public function store(StoreOrderRequest $request): OrderResource
    {
        $this->authorize('create', Order::class);

        $order = $this->service->create($request->validated());

        return new OrderResource($order);
    }

    public function show(Order $order): OrderResource
    {
        $this->authorize('view', $order);

        $order->load(['items.product:id,name,sku', 'customer:id,name', 'user:id,name']);

        return new OrderResource($order);
    }

    public function pay(Order $order, PayOrderRequest $request): OrderResource
    {
        $this->authorize('update', $order);

        $order = $this->service->pay(
            $order,
            $request->validated('payment_method'),
            (int) $request->validated('installments', 1),
        );

        return new OrderResource($order);
    }

    public function cancel(Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        $order->loadMissing('items');
        $this->service->cancel($order);

        return response()->json(['message' => 'Pedido cancelado com sucesso.']);
    }
}
