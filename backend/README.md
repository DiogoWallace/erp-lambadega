# ERP Comercial — Backend

API REST em Laravel 13 (PHP 8.4) para o ERP multi-tenant da Inovabi. Responsável por autenticação, RBAC, CRUD de domínio, movimentação de estoque e toda a lógica de negócio.

---

## Stack

| | |
|---|---|
| Framework | Laravel 13 (PHP-FPM 8.4) |
| Banco | MySQL 8.0 |
| Auth | Laravel Sanctum (token) + Spatie Permission (RBAC) |
| Identificadores | UUID v7 em todas as tabelas |
| Testes | PHPUnit — SQLite in-memory |
| Container | Docker + Compose v2 |

---

## Rodando localmente

Os comandos abaixo assumem que o Docker Compose já está up (`docker compose up -d` na raiz).

```bash
# Instalar dependências (necessário na primeira vez ou após recreate)
docker compose exec backend composer install

# Criar banco e rodar seeders
docker compose exec backend php artisan migrate:fresh --seed

# Criar symlink para servir uploads (avatares etc.) — já está no Dockerfile,
# só é necessário em containers pré-existentes / após recriar volumes:
docker compose exec backend php artisan storage:link

# Rodar os testes
make test-backend
# ou diretamente:
docker compose exec backend composer install --no-interaction --ignore-platform-reqs
docker compose exec backend php artisan test
```

> Os testes usam SQLite in-memory (`phpunit.xml`) — isolados do banco de desenvolvimento.

---

## Estrutura

```
backend/
├── app/
│   ├── Models/
│   │   ├── Concerns/
│   │   │   ├── HasUuidV7.php              UUID v7 como PK (Str::uuid7())
│   │   │   └── BelongsToEstablishment.php global scope + creating hook
│   │   ├── Establishment.php              raiz do tenant
│   │   ├── User.php
│   │   ├── Customer.php / Category.php / Supplier.php
│   │   ├── Product.php / StockMovement.php
│   │   └── Role.php / Permission.php      sobrescrevem Spatie p/ usar UUID v7
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/AuthController.php    login, logout, me
│   │   │   └── Api/                       um controller por módulo (só HTTP)
│   │   ├── Requests/                      validação com escopo multi-tenant
│   │   └── Resources/                     transformação JSON (JsonResource)
│   ├── Policies/                          autorização acoplada ao model
│   └── Services/                          regras de negócio, queries, transações
├── database/
│   ├── migrations/                        UUID + establishment_id em tudo
│   ├── factories/                         para testes
│   └── seeders/
│       ├── DatabaseSeeder.php             cria establishment + admin
│       └── RoleSeeder.php                 4 roles, 29+ permissões (idempotente)
├── tests/
│   ├── TestCase.php                       RefreshDatabase + seed(RoleSeeder) + helpers
│   └── Feature/Api/                       testes por módulo
├── routes/api.php
└── phpunit.xml                            SQLite in-memory
```

---

## Módulos e rotas

| Módulo | Rotas | Observações |
|---|---|---|
| Auth | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` | Sanctum token |
| Clientes | `GET/POST /customers`, `GET/PUT/DELETE /customers/{id}` | |
| Categorias | `GET/POST /categories`, `GET/PUT/DELETE /categories/{id}` | `?all=1` para dropdown (limite 500) |
| Fornecedores | `GET/POST /suppliers`, `GET/PUT/DELETE /suppliers/{id}` | `?all=1` para dropdown (limite 500) |
| Produtos | `GET/POST /products`, `GET/PUT/DELETE /products/{id}` | `?all=1` para dropdown (limite 500) |
| Estoque | `GET/POST /stock-movements`, `GET /stock-movements/{id}` | Imutável — sem update/delete |
| Notificações | `GET /notifications`, `GET /notifications/unread-count`, `GET /notifications/dropdown`, `POST /notifications/{id}/read`, `POST /notifications/mark-all-read`, `POST /notifications/broadcast` | Pessoais (user_id setado) + broadcast (user_id NULL, leitura por pivot). `broadcast` requer permissão `notification.broadcast`. |
| Meu perfil | `GET /me/profile`, `PUT /me/profile`, `POST /me/password`, `POST /me/avatar`, `DELETE /me/avatar`, `PATCH /me/preferences` | Self-only (sem id). `POST /me/password` exige `current_password` e revoga os demais tokens Sanctum. Avatar via multipart (JPG/PNG/WEBP, máx 2MB, 2000×2000), salvo em `storage/app/public/users/{uuid}/`. `PATCH /me/preferences` mescla chaves no JSON `users.preferences` (`sidebar_pinned`, `theme: light\|dark`, `language`) — sincroniza UI entre dispositivos. |
| Empresa | `GET /establishment`, `PUT /establishment` | Singleton do tenant — derivado do `establishment_id` do usuário. Leitura requer `settings.view`, escrita requer `settings.edit`. |
| Usuários | `GET/POST /users`, `GET/PUT/DELETE /users/{id}`, `POST /users/{id}/reset-password` | Multi-tenant escopado por `BelongsToEstablishment`. Gated por `users.*`. Reset-password gera senha de 12 chars, marca `must_change_password` e revoga tokens. Admin não pode deletar/resetar a si mesmo. |

Todas as rotas (exceto auth) exigem `Authorization: Bearer {token}`.

---

## Padrões obrigatórios

### Multi-tenancy

Todo model de domínio usa os dois traits de `Concerns/`:

```php
class Foo extends Model
{
    use BelongsToEstablishment, HasFactory, HasUuidV7, SoftDeletes;
}
```

- `HasUuidV7` — gera UUID v7 como PK
- `BelongsToEstablishment` — global scope filtra queries por `establishment_id`; creating hook preenche o campo automaticamente

Sempre usar `foreignUuid` em migrations, nunca `foreignId`. Unique constraints compostas com `establishment_id`:

```php
$table->unique(['establishment_id', 'document']);
```

### Autorização

Cada módulo tem uma Policy em `app/Policies/`. O controller usa `$this->authorize()` — o base `Controller` tem `AuthorizesRequests`. As Policies são auto-descobertas por convenção de nome.

```php
// No controller
public function index(Request $request): AnonymousResourceCollection
{
    $this->authorize('viewAny', Customer::class);
    return CustomerResource::collection($this->service->paginate(...));
}

// Na Policy
public function viewAny(User $user): bool
{
    return $user->can('customers.view'); // Spatie Permission
}
```

### Camadas

- **Controller** — só HTTP: valida com FormRequest, chama service, retorna Resource
- **Policy** — autorização; delega para Spatie (`$user->can(...)`)
- **Service** — regras de negócio, queries, transações
- **Resource** — transforma model em JSON

### Notificações

- Schema: `notifications` (UUID PK, `user_id` NULL = broadcast para todos do estabelecimento) + pivot `notification_reads(notification_id, user_id, read_at)` para marcar leitura per-user em broadcasts. Pessoais usam o `read_at` da própria linha.
- `NotificationService` é o único ponto de criação — pessoais (`createForUser`) e broadcast (`createBroadcast`, com dedup por 24h sobre `type` + chaves de `data`).
- Triggers automáticos:
  - **Estoque** — `InventoryService` emite `stock.out` (≤ 0) ou `stock.critical` (≤ `min_stock_quantity`) ao final de `record()` e `decreaseForOrder()`.
  - **Financeiro** — `finance:mark-overdue` emite `finance.overdue` por transação que vira `overdue`; `finance:notify-due-soon --days=3` emite `finance.due_soon` para pendentes próximas do vencimento. Ambos rodam no scheduler diário.
- Broadcast manual (atualizações do sistema, novidades) via `POST /notifications/broadcast`. Requer permissão `notification.broadcast` (apenas admin no `RoleSeeder`).

---

## Testes

```bash
make test-backend     # instala dev deps e roda toda a suite
```

- 96 feature tests cobrindo auth, permissões, CRUD e isolamento multi-tenant
- SQLite in-memory — rodam em ~5s
- Padrão: `Sanctum::actingAs($user)`, `$this->seed(RoleSeeder::class)` no setUp

---

## Variáveis de ambiente

Copiar `backend/.env.example` para `backend/.env` e ajustar:

| Variável | Descrição |
|---|---|
| `APP_KEY` | Gerado com `php artisan key:generate` |
| `DB_HOST / DATABASE / USERNAME / PASSWORD` | MySQL |
| `SANCTUM_STATEFUL_DOMAINS` | Domínios com acesso stateful |
| `SANCTUM_TOKEN_EXPIRATION` | Minutos até expirar (default 1440) |
| `CORS_ALLOWED_ORIGINS` | Origins permitidos |
