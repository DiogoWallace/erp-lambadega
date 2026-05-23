<?php

use App\Http\Controllers\Api\AuditLogController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FinancialTransactionController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::apiResource('customers', CustomerController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('suppliers', SupplierController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('stock-movements', StockMovementController::class)->only(['index', 'store', 'show']);
    Route::apiResource('audit-logs', AuditLogController::class)->only(['index', 'show']);
    Route::apiResource('orders', OrderController::class)->only(['index', 'store', 'show']);
    Route::post('orders/{order}/pay', [OrderController::class, 'pay']);
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel']);
    Route::apiResource('financial-transactions', FinancialTransactionController::class);
    Route::post('financial-transactions/{financial_transaction}/pay', [FinancialTransactionController::class, 'pay']);

    Route::prefix('reports')->group(function () {
        Route::get('sales',         [ReportController::class, 'sales']);
        Route::get('top-products',  [ReportController::class, 'topProducts']);
        Route::get('cash-flow',     [ReportController::class, 'cashFlow']);
        Route::get('accounts',      [ReportController::class, 'accounts']);
    });
});
