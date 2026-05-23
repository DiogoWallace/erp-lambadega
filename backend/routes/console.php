<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Manutenção diária do financeiro. Requer scheduler rodando
// (`php artisan schedule:run` por cron/container) — ainda não provisionado;
// até lá, rodar manualmente.
Schedule::command('finance:mark-overdue')->dailyAt('00:10');
Schedule::command('finance:notify-due-soon --days=3')->dailyAt('07:00');
