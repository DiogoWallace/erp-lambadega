<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Establishment\UpdateEstablishmentRequest;
use App\Http\Resources\EstablishmentResource;
use App\Services\EstablishmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EstablishmentController extends Controller
{
    public function __construct(private EstablishmentService $service) {}

    public function show(Request $request): JsonResponse
    {
        $establishment = $this->service->forUser($request->user());

        if (!$establishment) {
            return response()->json(['message' => 'Estabelecimento não encontrado.'], 404);
        }

        $this->authorize('view', $establishment);

        return response()->json([
            'data' => new EstablishmentResource($establishment),
        ]);
    }

    public function update(UpdateEstablishmentRequest $request): JsonResponse
    {
        $establishment = $this->service->forUser($request->user());

        if (!$establishment) {
            return response()->json(['message' => 'Estabelecimento não encontrado.'], 404);
        }

        $this->authorize('update', $establishment);

        $establishment = $this->service->update($establishment, $request->validated());

        return response()->json([
            'data' => new EstablishmentResource($establishment),
        ]);
    }
}
