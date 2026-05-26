<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

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

            // Fornecedores
            'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',

            // Categorias
            'categories.view', 'categories.create', 'categories.edit', 'categories.delete',

            // Produtos
            'products.view', 'products.create', 'products.edit', 'products.delete', 'products.quote',

            // Estoque
            'stock.view', 'stock.create',

            // Vendas
            'sales.view', 'sales.create', 'sales.edit', 'sales.delete',

            // Financeiro (contas a pagar/receber)
            'finance.view', 'finance.create', 'finance.edit', 'finance.delete',

            // Relatórios
            'reports.view',

            // Configurações
            'settings.view', 'settings.edit',

            // Dashboard
            'dashboard.view',
            'dashboard.view_all',

            // Auditoria
            'audit.view',

            // Notificações (broadcast — atualizações do sistema, novidades)
            'notification.broadcast',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web'])
            ->syncPermissions(Permission::all());

        Role::firstOrCreate(['name' => 'gerente', 'guard_name' => 'web'])
            ->syncPermissions([
                'dashboard.view',
                'dashboard.view_all',
                'users.view',
                'customers.view', 'customers.create', 'customers.edit',
                'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
                'categories.view', 'categories.create', 'categories.edit',
                'products.view', 'products.create', 'products.edit', 'products.quote',
                'stock.view', 'stock.create',
                'sales.view', 'sales.create', 'sales.edit',
                'finance.view', 'finance.create', 'finance.edit',
                'reports.view',
            ]);

        Role::firstOrCreate(['name' => 'vendedor', 'guard_name' => 'web'])
            ->syncPermissions([
                'dashboard.view',
                'customers.view', 'customers.create', 'customers.edit',
                'products.view',
                'stock.view',
                'sales.view', 'sales.create',
            ]);

        Role::firstOrCreate(['name' => 'financeiro', 'guard_name' => 'web'])
            ->syncPermissions([
                'dashboard.view',
                'dashboard.view_all',
                'customers.view',
                'suppliers.view',
                'stock.view',
                'sales.view',
                'finance.view', 'finance.create', 'finance.edit', 'finance.delete',
                'reports.view',
            ]);
    }
}
