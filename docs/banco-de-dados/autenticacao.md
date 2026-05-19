# Autenticação

## users

Usuários do sistema. Autenticação via Laravel Sanctum com tokens de API.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `name` | VARCHAR | Nome completo |
| `email` | VARCHAR UNIQUE | E-mail de acesso |
| `password` | VARCHAR | Hash bcrypt |
| `phone` | VARCHAR(20) nullable | Telefone de contato |
| `is_active` | BOOLEAN default true | Conta ativa/desativada |
| `email_verified_at` | TIMESTAMP nullable | Data de verificação do e-mail |
| `remember_token` | VARCHAR nullable | Token de sessão web |
| `created_at` / `updated_at` | TIMESTAMP | — |
| `deleted_at` | TIMESTAMP nullable | Soft delete |

**Traits:** `HasApiTokens`, `HasRoles`, `SoftDeletes`

---

## roles

Cargos/perfis de acesso. Gerenciados pelo Spatie Laravel Permission.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `name` | VARCHAR | Nome do role (ex: `admin`) |
| `guard_name` | VARCHAR | Guard do Laravel (padrão: `web`) |
| `created_at` / `updated_at` | TIMESTAMP | — |

**Roles iniciais:** `admin`, `gerente`, `vendedor`, `financeiro`

---

## permissions

Permissões granulares por ação. Gerenciadas pelo Spatie Laravel Permission.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | BIGINT PK | — |
| `name` | VARCHAR | Ex: `products.create` |
| `guard_name` | VARCHAR | Guard do Laravel |
| `created_at` / `updated_at` | TIMESTAMP | — |

**Padrão de nomenclatura:** `{módulo}.{ação}` — ex: `customers.view`, `sales.delete`

**Permissões por módulo:**

| Módulo | Permissões |
|---|---|
| `users` | view, create, edit, delete |
| `customers` | view, create, edit, delete |
| `products` | view, create, edit, delete |
| `sales` | view, create, edit, delete |
| `reports` | view |
| `settings` | view, edit |

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
