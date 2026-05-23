<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas.'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['message' => 'Conta desativada. Entre em contato com o administrador.'], 403);
        }

        $token = $user->createToken('erp-token')->plainTextToken;

        app(AuditService::class)->log('login', 'auth', $user->id, $user->establishment_id);

        return response()->json([
            'data' => [
                'user' => $this->formatUser($user),
                'token' => $token,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        app(AuditService::class)->log('logout', 'auth');

        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->formatUser($request->user()),
        ]);
    }

    private function formatUser(User $user): array
    {
        return [
            ...$user->toArray(),
            'avatar_url'           => $user->avatarUrl(),
            'must_change_password' => (bool) $user->must_change_password,
            'roles'                => $user->getRoleNames(),
            'permissions'          => $user->getAllPermissions()->pluck('name'),
        ];
    }
}
