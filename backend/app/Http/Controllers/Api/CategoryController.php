<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\CategoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(private CategoryService $service) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Category::class);

        if ($request->boolean('all')) {
            return CategoryResource::collection($this->service->all());
        }

        $categories = $this->service->paginate($request->only(['search', 'is_active']));

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);

        $category = $this->service->create($request->validated());

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function show(Request $request, Category $category): CategoryResource
    {
        $this->authorize('view', $category);

        return new CategoryResource($category->load('parent'));
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $this->authorize('update', $category);

        $category = $this->service->update($category, $request->validated());

        return new CategoryResource($category);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        $this->authorize('delete', $category);

        $this->service->delete($category);

        return response()->json(null, 204);
    }
}
