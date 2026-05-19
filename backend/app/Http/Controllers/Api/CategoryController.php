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
        abort_if($request->user()->cannot('categories.view'), 403, 'Sem permissão.');

        if ($request->boolean('all')) {
            return CategoryResource::collection($this->service->all());
        }

        $categories = $this->service->paginate($request->only(['search', 'is_active']));

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        abort_if($request->user()->cannot('categories.create'), 403, 'Sem permissão.');

        $category = $this->service->create($request->validated());

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function show(Request $request, Category $category): CategoryResource
    {
        abort_if($request->user()->cannot('categories.view'), 403, 'Sem permissão.');

        return new CategoryResource($category->load('parent'));
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        abort_if($request->user()->cannot('categories.edit'), 403, 'Sem permissão.');

        $category = $this->service->update($category, $request->validated());

        return new CategoryResource($category);
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        abort_if($request->user()->cannot('categories.delete'), 403, 'Sem permissão.');

        $this->service->delete($category);

        return response()->json(null, 204);
    }
}
