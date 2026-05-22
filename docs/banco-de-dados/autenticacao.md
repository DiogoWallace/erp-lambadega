# Autenticação

## users

Usuários do sistema. Autenticação via Laravel Sanctum com tokens de API.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID v7 PK | — |
| `establishment_id` | UUID FK | Tenant ao qual o usuário pertence |
| `name` | VARCHAR | Nome completo |
| `email` | VARCHAR UNIQUE | E-mail de acesso |
| `password` | VARCHAR | Hash bcrypt |
| `phone` | VARCHAR(20) nullable | Telefone de contato |
| `is_active` | BOOLEAN default true | Conta ativa/desativada |
| `email_verified_at` | TIMESTAMP nullable | Data de verificação do e-mail |
| `remember_token` | VARCHAR nullable | Token de sessão web |
| `created_at` / `updated_at` | TIMESTAMP | — |
| `deleted_at` | TIMESTAMP nullable | Soft delete |

**Traits:** `HasApiTokens`, `HasRoles`, `HasUuidV7`, `SoftDeletes`

---

## roles

Cargos/perfis de acesso. Gerenciados pelo Spatie Laravel Permission (subclasse local para usar UUID v7).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID v7 PK | — |
| `name` | VARCHAR | Nome do role (ex: `admin`) |
| `guard_name` | VARCHAR | Guard do Laravel (padrão: `web`) |
| `created_at` / `updated_at` | TIMESTAMP | — |

**Roles e permissões:**

| Role | Acesso |
|---|---|
| `admin` | Todas as permissões, incluindo `audit.view` |
| `gerente` | Gestão operacional (sem delete de clientes/categorias, sem configurações, sem auditoria) |
| `vendedor` | Clientes (view/create/edit), produtos (view), estoque (view), vendas (view/create) |
| `financeiro` | Clientes (view), fornecedores (view), estoque (view), vendas (view), relatórios (view) |

---

## permissions

Permissões granulares por ação. Gerenciadas pelo Spatie Laravel Permission (subclasse local para usar UUID v7).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | UUID v7 PK | — |
| `name` | VARCHAR | Ex: `products.create` |
| `guard_name` | VARCHAR | Guard do Laravel |
| `created_at` / `updated_at` | TIMESTAMP | — |

**Padrão de nomenclatura:** `{módulo}.{ação}` — ex: `customers.view`, `sales.delete`

**Permissões por módulo:**

| Módulo | Permissões |
|---|---|
| `users` | view, create, edit, delete |
| `customers` | view, create, edit, delete |
| `suppliers` | view, create, edit, delete |
| `categories` | view, create, edit, delete |
| `products` | view, create, edit, delete |
| `stock` | view, create |
| `sales` | view, create, edit, delete |
| `reports` | view |
| `settings` | view, edit |
| `audit` | view (**somente admin**) |

---

## model_has_roles / model_has_permissions / role_has_permissions

Tabelas pivot do Spatie. Não manipular diretamente — usar os métodos do Model:

```php
$user->assignRole('admin');
$user->hasRole('gerente');
$user->can('products.create');
```

---

## personal_access_tokens

Tokens de API gerados pelo Sanctum ao fazer login.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `tokenable_type` / `tokenable_id` | MORPHS | Polimórfico (User) |
| `name` | VARCHAR | Nome do token (ex: `erp-token`) |
| `token` | VARCHAR(64) UNIQUE | Hash SHA-256 do token |
| `abilities` | TEXT nullable | JSON de abilities |
| `last_used_at` | TIMESTAMP nullable | Último uso |
| `expires_at` | TIMESTAMP nullable | Expiração (configurável via `SANCTUM_TOKEN_EXPIRATION`) |
| `created_at` / `updated_at` | TIMESTAMP | — |
