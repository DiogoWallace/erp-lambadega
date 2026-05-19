<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Usuários
            'users.view', 'users.create', 'users.edit', 'users.delete',

            // Clientes
            'customers.view', 'customers.create', 'customers.edit', 'customers.delete',

            // Produtos
            'products.view', 'products.create', 'products.edit', 'products.delete',

            // Vendas
            'sales.view', 'sales.create', 'sales.edit', 'sales.delete',

            // Relatórios
            'reports.view',

            // Configurações
            'settings.view', 'settings.edit',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web'])
            ->syncPermissions(Permission::all());

        Role::firstOrCreate(['name' => 'gerente', 'guard_name' => 'web'])
            ->syncPermissions([
                'users.view',
                'customers.view', 'customers.create', 'customers.edit',
                'products.view', 'products.create', 'products.edit',
                'sales.view', 'sales.create', 'sales.edit',
                'reports.view',
            ]);

        Role::firstOrCreate(['name' => 'vendedor', 'guard_name' => 'web'])
            ->syncPermissions([
                'customers.view', 'customers.create', 'customers.edit',
                'products.view',
                'sales.view', 'sales.create',
            ]);

        Role::firstOrCreate(['name' => 'financeiro', 'guard_name' => 'web'])
            ->syncPermissions([
                'customers.view',
                'sales.view',
                'reports.view',
            ]);
    }
}
