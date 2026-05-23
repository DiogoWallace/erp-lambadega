<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $paginator = $this->service->forUser(
            $user,
            $request->only(['type', 'status']),
        );

        $paginator->load(['readers' => fn ($q) => $q->where('user_id', $user->id)]);

        return NotificationResource::collection($paginator);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json(['count' => $this->service->unreadCount($request->user())]);
    }

    public function dropdown(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();

        $items = $this->service->latestForUser($user, 10);
        $items->load(['readers' => fn ($q) => $q->where('user_id', $user->id)]);

        return NotificationResource::collection($items);
    }

    public function markRead(Request $request, Notification $notification): JsonResponse
    {
        $this->authorize('view', $notification);

        $this->service->markRead($notification, $request->user());

        return response()->json(['ok' => true]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $this->service->markAllRead($request->user());

        return response()->json(['ok' => true]);
    }

    public function broadcast(Request $request): JsonResponse
    {
        $this->authorize('broadcast', Notification::class);

        $data = $request->validate([
            'type'       => 'required|string|max:40',
            'severity'   => 'required|in:info,warning,critical',
            'title'      => 'required|string|max:200',
            'body'       => 'nullable|string|max:2000',
            'action_url' => 'nullable|string|max:255',
        ]);

        $notification = $this->service->createBroadcast(
            $request->user()->establishment_id,
            $data['type'],
            $data['title'],
            $data['severity'],
            $data['body'] ?? null,
            $data['action_url'] ?? null,
        );

        return response()->json(['ok' => true, 'id' => $notification?->id], 201);
    }
}
