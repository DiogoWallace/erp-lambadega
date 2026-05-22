<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Marca contas vencidas diariamente. Requer um scheduler rodando
// (`php artisan schedule:run` por cron/container) — ainda não provisionado;
// até lá, rodar manualmente: `php artisan finance:mark-overdue`.
Schedule::command('finance:mark-overdue')->dailyAt('00:10');
