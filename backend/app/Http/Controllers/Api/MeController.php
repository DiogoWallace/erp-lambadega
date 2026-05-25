<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Me\ChangePasswordRequest;
use App\Http\Requests\Me\UpdateProfileRequest;
use App\Http\Requests\Me\UploadAvatarRequest;
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
                'id'                   => $user->id,
                'name'                 => $user->name,
                'email'                => $user->email,
                'phone'                => $user->phone,
                'avatar_url'           => $user->avatarUrl(),
                'must_change_password' => (bool) $user->must_change_password,
                'roles'                => $user->getRoleNames(),
                'permissions'          => $user->getAllPermissions()->pluck('name'),
            ],
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $this->service->updateProfile($request->user(), $request->validated());

        return response()->json([
            'data' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'phone'      => $user->phone,
                'avatar_url' => $user->avatarUrl(),
            ],
        ]);
    }

    public function uploadAvatar(UploadAvatarRequest $request): JsonResponse
    {
        $user = $this->service->updateAvatar($request->user(), $request->file('avatar'));

        return response()->json([
            'data' => [
                'id'         => $user->id,
                'avatar_url' => $user->avatarUrl(),
            ],
        ]);
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $this->service->removeAvatar($request->user());

        return response()->json(['ok' => true]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferences'                  => ['required', 'array'],
            'preferences.sidebar_pinned'   => ['sometimes', 'array'],
            'preferences.sidebar_pinned.*' => ['string'],
            'preferences.theme'            => ['sometimes', 'in:light,dark'],
            'preferences.language'         => ['sometimes', 'string', 'max:10'],
        ]);

        $user = $request->user();
        $current = $user->preferences ?? [];
        $user->preferences = array_replace($current, $validated['preferences']);
        $user->save();

        return response()->json(['data' => ['preferences' => $user->preferences]]);
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
