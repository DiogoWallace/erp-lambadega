<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(\App\Services\AuditService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Listeners de venda (GenerateFinancialTransactions, CancelOrderFinancials)
        // são auto-descobertos pelo Laravel a partir do type-hint do handle().
    }
}
