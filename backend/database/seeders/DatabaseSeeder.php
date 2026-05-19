<?php

namespace Database\Seeders;

use App\Models\Establishment;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $establishment = Establishment::firstOrCreate(
            ['document' => '00000000000000'],
            [
                'name'       => 'Inovabi',
                'trade_name' => 'Inovabi',
                'is_active'  => true,
            ]
        );

        $admin = User::firstOrCreate(
            ['email' => 'admin@inovabi.com'],
            [
                'name'             => 'Admin',
                'password'         => 'password',
                'is_active'        => true,
                'establishment_id' => $establishment->id,
            ]
        );

        $admin->assignRole('admin');
    }
}
