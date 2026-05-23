<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Me\ChangePasswordRequest;
use App\Http\Requests\Me\UpdateProfileRequest;
use App\Services\UserProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function __construct(private UserProfileService $service) {}

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'id'          => $user->id,
                'name'        => $user->name,
                'email'       => $user->email,
                'phone'       => $user->phone,
                'roles'       => $user->getRoleNames(),
                'permissions' => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->service->updateProfile($request->user(), $request->validated());

        return response()->json([
            'data' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
            ],
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $ok = $this->service->changePassword(
            $request->user(),
            $request->input('current_password'),
            $request->input('new_password'),
        );

        if (!$ok) {
            return response()->json([
                'message' => 'A senha atual está incorreta.',
                'errors'  => ['current_password' => ['A senha atual está incorreta.']],
            ], 422);
        }

        return response()->json(['message' => 'Senha alterada com sucesso.']);
    }
}
