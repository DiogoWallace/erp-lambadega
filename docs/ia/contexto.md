# Contexto do Projeto — ERP Comercial

> Documento para orientar agentes de IA. Leia também [`docs/arquitetura/`](../arquitetura/) para decisões de longo prazo e [`docs/banco-de-dados/`](../banco-de-dados/) para schema.

## Visão Geral

ERP comercial multi-tenant para varejo (lojas, restaurantes, adegas). Está sendo construído como SaaS web (Fase 1), com arquitetura preparada para evolução **hub-and-spoke** com servidores locais (Fase 2) e PDV nativo com integração de hardware (Fase 3). Ver [roadmap](../arquitetura/roadmap.md).

Empresa: Inovabi. Domínio: `inovabi.com`.

---

## Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Backend | Laravel (PHP-FPM) | 13.x (PHP 8.4) |
| Frontend | Next.js (App Router) | 16.x |
| Banco | MySQL | 8.0 |
| Auth | Laravel Sanctum (token) + Spatie Permission (RBAC) | — |
| Identificadores | UUID v7 (sortable) em todas as tabelas | — |
| Web server | nginx | alpine |
| Containers | Docker + Compose v2 | — |
| CI/CD | GitHub Actions | — |
| SSL | Let's Encrypt (certbot) | — |

---

## Ambientes

| Ambiente | Branch | Frontend | API |
|---|---|---|---|
| Local | qualquer | http://localhost:8000 | http://localhost:8001 |
| Dev | `dev` | https://dev.inovabi.com | https://api-dev.inovabi.com |
| Prod | `main` | https://inovabi.com | https://api.inovabi.com |

Credenciais seedadas: `admin@inovabi.com` / `password`.

---

## Estrutura do Repositório

```
erp-comercial/
├── backend/                              Laravel 13 API
│   ├── app/
│   │   ├── Models/
│   │   │   ├── Concerns/
│   │   │   │   ├── HasUuidV7.php         UUID v7 via Str::uuid7()
│   │   │   │   ├── BelongsToEstablishment.php  global scope + creating hook
│   │   │   │   └── LogsActivity.php      trait de auditoria (observers created/updating/updated/deleted + diff)
│   │   │   ├── Establishment.php         tenant root
│   │   │   ├── User.php                  HasUuidV7 + HasRoles + HasApiTokens
│   │   │   ├── AuditLog.php              log imutável (HasUuidV7; sem updated_at; CONST UPDATED_AT = null)
│   │   │   ├── Customer.php / Supplier.php / Category.php / Product.php
│   │   │   ├── Order.php / OrderItem.php / StockMovement.php
│   │   │   ├── FinancialTransaction.php
│   │   │   ├── Role.php / Permission.php  override Spatie p/ usar UUID
│   │   │   └── SyncLog.php               schema da Fase 2
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Auth/AuthController.php
│   │   │   │   └── Api/                  controllers de domínio (sem lógica de negócio)
│   │   │   │       ├── CustomerController.php
│   │   │   │       ├── CategoryController.php
│   │   │   │       ├── SupplierController.php
│   │   │   │       ├── ProductController.php   suporta ?all=1 (limitado a 500)
│   │   │   │       ├── StockMovementController.php  só index/store/show (log imutável)
│   │   │   │       ├── AuditLogController.php  só index/show; restrito ao role admin
│   │   │   │       ├── OrderController.php   index/store/show + pay/cancel; sales.* permissions
│   │   │   │       └── DashboardController.php  GET /api/dashboard; requer dashboard.view; retorna JSON direto (sem Resource — endpoint de agregação sem model)
│   │   │   ├── Requests/
│   │   │   │   ├── Auth/LoginRequest.php
│   │   │   │   ├── Customer/{Store,Update}CustomerRequest.php
│   │   │   │   ├── Category/{Store,Update}CategoryRequest.php
│   │   │   │   ├── Supplier/{Store,Update}SupplierRequest.php
│   │   │   │   ├── Product/{Store,Update}ProductRequest.php
│   │   │   │   └── StockMovement/StoreStockMovementRequest.php
│   │   │   └── Resources/               transforma output JSON (JsonResource)
│   │   │       ├── CustomerResource.php
│   │   │       ├── CategoryResource.php
│   │   │       ├── SupplierResource.php
│   │   │       ├── ProductResource.php   inclui category e supplier via whenLoaded
│   │   │       ├── StockMovementResource.php  inclui product e user via whenLoaded
│   │   │       └── AuditLogResource.php  model_type exibe só basename (ex: Customer)
│   │   ├── Policies/                    autorização acoplada ao model (auto-descoberta Laravel)
│   │   │   ├── CustomerPolicy.php
│   │   │   ├── CategoryPolicy.php
│   │   │   ├── SupplierPolicy.php
│   │   │   ├── ProductPolicy.php
│   │   │   ├── StockMovementPolicy.php  só viewAny/view/create (sem update/delete — log imutável)
│   │   │   └── AuditLogPolicy.php       só viewAny/view; requer permissão audit.view (admin only)
│   │   ├── Services/                    regras de negócio (queries, CRUD)
│   │   │   ├── CustomerService.php
│   │   │   ├── CategoryService.php      all() limitado a 500 registros
│   │   │   ├── SupplierService.php      all() limitado a 500 registros
│   │   │   ├── ProductService.php       filtros: search, category_id, supplier_id, is_active, low_stock; all() limitado a 500
│   │   │   ├── InventoryService.php     dono ÚNICO das escritas de estoque (record manual + decreaseForOrder/restoreForOrder); usa DB::transaction + lockForUpdate
│   │   │   ├── OrderService.php         orquestra estado do pedido + despacha eventos (OrderCreated/Paid/Cancelled); recebe DTOs; delega estoque ao InventoryService; NÃO toca StockMovement/FinancialTransaction
│   │   │   ├── DashboardService.php     metrics(period, dateFrom, dateTo); agrega receita, pedidos, ticket médio, low stock, últimas vendas
│   │   │   ├── ReportService.php        leitura-apenas; salesByPeriod / topProducts / cashFlow / accountsStatus — camada Deptrac própria com acesso a FinancialModel
│   │   │   └── AuditService.php         singleton; logModel(), log(), queueUpdate()/dequeuePendingUpdate()
│   │   ├── DataTransferObjects/         DTOs readonly tipados (fromArray): CreateOrderDTO, OrderItemDTO, PayOrderDTO
│   │   ├── Events/                      eventos de domínio: OrderCreated, OrderPaid, OrderCancelled
│   │   ├── Listeners/                   auto-descobertos: GenerateFinancialTransactions (OrderPaid), CancelOrderFinancials (OrderCancelled)
│   │   └── Providers/AppServiceProvider.php  registra AuditService como singleton (listeners são auto-descobertos, NÃO registrar aqui)
│   ├── database/
│   │   ├── migrations/                   tudo com UUID + establishment_id
│   │   ├── factories/
│   │   │   ├── EstablishmentFactory.php
│   │   │   ├── UserFactory.php           inclui establishment_id por padrão
│   │   │   ├── CustomerFactory.php
│   │   │   ├── CategoryFactory.php
│   │   │   ├── SupplierFactory.php
│   │   │   ├── ProductFactory.php
│   │   │   └── StockMovementFactory.php
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php        cria establishment + admin
│   │       └── RoleSeeder.php            4 roles, 32+ permissions (idempotente); dashboard.view em todos os roles; audit.view só para admin
│   ├── tests/
│   │   ├── TestCase.php                  RefreshDatabase + seed(RoleSeeder) + helpers
│   │   ├── Feature/
│   │   │   └── Api/
│   │   │       ├── CustomerTest.php      auth, permissões, CRUD, multi-tenant
│   │   │       ├── CategoryTest.php      + slug, parent_id, ?all=1
│   │   │       ├── SupplierTest.php      + CNPJ único por establishment
│   │   │       ├── ProductTest.php       + SKU/barcode únicos, filtro low_stock, category_id de outro tenant
│   │   │       └── StockMovementTest.php in/out/adjustment, estoque insuficiente, isolamento multi-tenant
│   │   └── Unit/                         (a ser expandido)
│   ├── phpunit.xml                       SQLite in-memory para testes rápidos
│   ├── config/
│   │   ├── permission.php                aponta para App\Models\{Role,Permission}
│   │   ├── sanctum.php
│   │   └── cors.php
│   └── routes/api.php
│
├── frontend/                             Next.js 16
│   ├── proxy.ts                          auth check na borda (antigo middleware)
│   ├── vitest.config.ts                  testes unitários (node environment)
│   ├── app/
│   │   ├── (dashboard)/                  ROUTE GROUP — não aparece na URL
│   │   │   ├── __tests__/
│   │   │   │   └── build-body.test.ts    21 testes unitários (vitest) para os 5 módulos
│   │   │   ├── layout.tsx                async; faz fetch /auth/me p/ determinar canAudit; passa prop p/ SidebarNav
│   │   │   ├── sidebar-nav.tsx           client component (usePathname); aceita canAudit prop
│   │   │   ├── sidebar-user.tsx          async; usa apiFetch('/auth/me'), redireciona se 401
│   │   │   ├── actions.ts                logoutAction
│   │   │   ├── dashboard/                rota: /dashboard
│   │   │   │   ├── page.tsx              server component; usa ?period=today|week|month|custom + date_from/date_to
│   │   │   │   ├── loading.tsx           DashboardSkeleton
│   │   │   │   └── period-selector.tsx   client; useRouter().push() para trocar período (sem form GET — navegação instantânea)
│   │   │   ├── customers/                rota: /customers
│   │   │   │   ├── page.tsx              lista server-side
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   ├── customer-form.tsx     client; useActionState
│   │   │   │   ├── delete-button.tsx     client; confirm() + form action
│   │   │   │   ├── build-body.ts         função pura — extrai FormData → objeto de API
│   │   │   │   └── actions.ts            create/update/delete (importa build-body)
│   │   │   ├── error.tsx                 error boundary do dashboard (client)
│   │   │   ├── categories/               rota: /categories
│   │   │   │   ├── page.tsx              lista server-side
│   │   │   │   ├── new/page.tsx          recebe lista p/ dropdown de pai
│   │   │   │   ├── [id]/edit/page.tsx    exclui a própria categoria do dropdown
│   │   │   │   ├── category-form.tsx     client; useActionState
│   │   │   │   ├── delete-button.tsx     client; confirm() + form action
│   │   │   │   ├── build-body.ts         função pura
│   │   │   │   └── actions.ts            create/update/delete
│   │   │   ├── suppliers/                rota: /suppliers
│   │   │   │   ├── page.tsx              lista; formata CNPJ
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   ├── supplier-form.tsx     4 seções: empresa, contato, endereço, notas
│   │   │   │   ├── delete-button.tsx
│   │   │   │   ├── build-body.ts         função pura
│   │   │   │   └── actions.ts
│   │   │   ├── products/                 rota: /products
│   │   │   │   ├── page.tsx              lista; filtros: search, categoria, status, low_stock; link "+ Mov."
│   │   │   │   ├── new/page.tsx          carrega categorias + fornecedores p/ dropdowns
│   │   │   │   ├── [id]/edit/page.tsx    carrega produto + categorias + fornecedores
│   │   │   │   ├── product-form.tsx      4 seções: informações, preços, estoque/id, descrição
│   │   │   │   ├── delete-button.tsx
│   │   │   │   ├── build-body.ts         função pura; converte strings para float/int
│   │   │   │   └── actions.ts
│   │   │   ├── stock-movements/          rota: /stock-movements
│   │   │   │   ├── page.tsx              lista; filtros: produto, tipo, datas; badges coloridos
│   │   │   │   ├── new/page.tsx          aceita ?product_id= para pré-preencher produto
│   │   │   │   ├── movement-form.tsx     client; campo cost_price condicional (só para "in")
│   │   │   │   ├── build-body.ts         função pura
│   │   │   │   └── actions.ts            createStockMovementAction; redireciona filtrado por produto
│   │   │   ├── sales/                    rota: /sales
│   │   │   │   ├── page.tsx              lista; filtros: status, cliente, período, busca por nº
│   │   │   │   ├── loading.tsx           TableSkeleton
│   │   │   │   ├── actions.ts            createSaleAction, paySaleAction, cancelSaleAction
│   │   │   │   ├── new/
│   │   │   │   │   ├── page.tsx          carrega produtos ativos + clientes server-side
│   │   │   │   │   ├── sale-form.tsx     client; busca produto por texto; carrinho editável; desconto; parcelamento
│   │   │   │   │   └── build-body.ts     buildBody: deserializa JSON do carrinho, normaliza números
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          detalhe do pedido; botões Pagar/Cancelar (só pending)
│   │   │   │       ├── loading.tsx       TableSkeleton
│   │   │   │       ├── pay-form.tsx      client; modal com payment_method + parcelas (crédito)
│   │   │   │       └── cancel-form.tsx   client; modal de confirmação; avisa que estoque será devolvido
│   │   │   ├── audit-logs/               rota: /audit-logs (visível só para admin)
│   │   │   │   ├── page.tsx              lista server-side; filtros: evento, módulo, período
│   │   │   │   └── loading.tsx           TableSkeleton
│   │   │   └── reports/                  rota: /reports (requer reports.view)
│   │   │       ├── page.tsx              índice com 4 cards (sales, top-products, cash-flow, accounts)
│   │   │       ├── _lib.ts               formatBRL, formatDate, defaultDateRange, buildExportHref
│   │   │       ├── _filters.tsx          DateRangeFilter — form GET com date_from/date_to + slot + botão "Exportar CSV"
│   │   │       ├── sales/page.tsx        cards resumo, breakdown por payment_method, tabela de pedidos
│   │   │       ├── top-products/page.tsx tabela ranking por receita (ignora pedidos não pagos)
│   │   │       ├── cash-flow/page.tsx    realizado vs projetado + tabela diária com saldo acumulado
│   │   │       └── accounts/page.tsx     cards por status + tabela detalhada; filtros: tipo, status, due_from/due_to
│   │   ├── api/
│   │   │   ├── auth/clear/route.ts       limpa cookie inválido
│   │   │   └── reports/export/route.ts   proxy de download CSV (busca da API com ?format=csv e repassa headers)
│   │   ├── lib/
│   │   │   ├── api.ts                    apiFetch (token do cookie; 401→clear, 403→dashboard, 5xx→throw)
│   │   │   └── types.ts                  Customer, Category, Supplier, Product, StockMovement, AuditLog, PaginatedResponse
│   │   ├── ui/skeletons.tsx              TableSkeleton, FormSkeleton, etc.
│   │   ├── login/
│   │   │   ├── page.tsx
│   │   │   └── actions.ts                loginAction (seta cookie token)
│   │   └── page.tsx                      home pública (em construção)
│   └── next.config.ts                    serverActions.allowedOrigins
│
├── nginx/conf.d/
│   ├── default.conf                      SSL prod+dev (4 domínios)
│   ├── local.conf                        HTTP local (portas 8000/8001)
│   └── dev.conf                          dev no VPS (portas 8080/8081)
│
├── Makefile                              atalhos: make test, make migrate, make shell…
├── docker-compose.yml                    local (monta tests/ e phpunit.xml como volumes)
├── docker-compose.dev.yml                dev (VPS, rede erp_shared)
├── docker-compose.prod.yml               prod (VPS, cria rede erp_shared)
│
├── .github/workflows/
│   ├── deploy.yml                        push main → prod
│   └── deploy-dev.yml                    push dev → dev
│
└── docs/
    ├── arquitetura/                      visão, multi-tenant, sync, roadmap
    ├── banco-de-dados/                   schema por módulo
    ├── tutoriais/                        rodar local, deploy
    └── ia/                               este arquivo
```

---

## Padrões obrigatórios

### Backend

**Todo model de domínio** (que tem `establishment_id`) deve usar:

```php
use App\Models\Concerns\BelongsToEstablishment;
use App\Models\Concerns\HasUuidV7;
use App\Models\Concerns\LogsActivity;

class Foo extends Model
{
    use BelongsToEstablishment, HasFactory, HasUuidV7, LogsActivity, SoftDeletes;

    protected static string $auditModule = 'foos';   // nome do módulo no audit_log
}
```

- `HasUuidV7` — gera UUID v7 como PK
- `BelongsToEstablishment` — global scope (filtra queries por `establishment_id` do user logado) + creating hook (preenche o campo automaticamente)
- `LogsActivity` — registra automaticamente `created`, `updated` (diff de campos) e `deleted` na tabela `audit_logs`. Nunca quebra o fluxo principal (try-catch silencioso). Requer que `AuditService` seja singleton no container (já configurado em `AppServiceProvider`).
- Inclua `'establishment_id'` no `#[Fillable]` (para que seeders funcionem)

**Campos excluídos do diff de auditoria** por padrão: `id`, `establishment_id`, `updated_at`, `created_at`, `deleted_at`, `remember_token`. Para excluir campos adicionais no model:
```php
protected static array $auditExclude = ['password', 'token'];
```

**Migrations** sempre:

```php
$table->uuid('id')->primary();
$table->foreignUuid('establishment_id')->constrained()->cascadeOnDelete();
// FKs são foreignUuid, nunca foreignId
// Morphs polimórficos são uuidMorphs / nullableUuidMorphs
```

**Unique constraints multi-tenant:** compostos com `establishment_id`:

```php
$table->unique(['establishment_id', 'document']);  // cada tenant pode ter o mesmo CPF
```

**Validation de unique** em FormRequests deve escopar por establishment:

```php
Rule::unique('customers', 'document')
    ->ignore($this->route('customer'))
    ->where(fn ($q) => $q->where('establishment_id', auth()->user()->establishment_id))
```

**Arquitetura de camadas** — todo módulo de domínio segue:

- `Controllers/Api/FooController` — só HTTP: recebe request, chama service, retorna resource. Nada de queries ou regras aqui.
- `Policies/FooPolicy` — autorização acoplada ao model; delegam para `$user->can('foo.action')` via Spatie.
- `Services/FooService` — regras de negócio, queries, paginação, CRUD.
- `Resources/FooResource` — transforma o model em JSON (substitui `response()->json()` manual).
- `Requests/Foo/{Store,Update}FooRequest` — validação com escopo multi-tenant.

```php
// Controller enxuto — autorização via Policy (auto-descoberta por convenção de nome)
public function index(Request $request): AnonymousResourceCollection
{
    $this->authorize('viewAny', Foo::class);
    return FooResource::collection($this->service->paginate($request->only(['search', 'is_active'])));
}
```

**Permissões** verificadas via `$this->authorize()` no controller. O base `Controller` tem o trait `AuthorizesRequests`. As Policies ficam em `app/Policies/` e são auto-descobertas pelo Laravel por convenção de nome (`FooPolicy` para `Foo`). **Não usar `abort_if` para permissões** — a Policy pode ser reutilizada de Jobs, Artisan commands e outros contextos fora do HTTP.

```php
// FooPolicy — delega para Spatie Permission
public function viewAny(User $user): bool { return $user->can('foo.view'); }
public function create(User $user): bool  { return $user->can('foo.create'); }
public function update(User $user, Foo $foo): bool { return $user->can('foo.edit'); }
public function delete(User $user, Foo $foo): bool { return $user->can('foo.delete'); }
```

### Frontend

**Rotas autenticadas** vivem em `app/(dashboard)/`. O parêntese **remove** o segmento da URL — `app/(dashboard)/customers/page.tsx` é a rota `/customers`.

**Auth na borda:** `proxy.ts` verifica só a existência do token no cookie. NÃO faz chamada à API (rodaria em todo prefetch). Token inválido é tratado pelas Server Components via `apiFetch`.

**API fetch em Server Components:**

```ts
import { apiFetch } from '@/app/lib/api'
const res = await apiFetch(`/customers?${params}`)
```

`apiFetch` injeta o `Authorization: Bearer ${token}` e em 401 redireciona para `/api/auth/clear` (route handler que limpa o cookie e manda pra `/login`).

**Mutações:** Server Actions em `actions.ts`, formulários client usam `useActionState`:

```tsx
'use client'
const [state, formAction, pending] = useActionState(action, null)
return <form action={formAction}>...</form>
```

**`build-body.ts`** — cada módulo tem um arquivo `build-body.ts` com uma função pura `buildBody(formData: FormData)` que converte os campos do formulário para o objeto de API (parseia números, trata strings vazias como `null`, etc.). As Server Actions importam essa função. Isso separa a lógica de transformação do contexto de servidor (`'use server'`) e permite testar sem mocks.

**Para passar IDs em actions** (UUID = string):

```ts
const boundUpdate = updateCustomerAction.bind(null, customer.id)
```

**Loading states:** cada rota tem seu `loading.tsx` que importa um skeleton de `@/app/ui/skeletons`. Padrão reutilizável — não criar skeletons inline.

**Tipos:** ids são `string` (UUID), nunca `number`.

---

## Gotchas

- **Sanctum's `PersonalAccessToken`** mantém `id` como `bigint` — só os `morphs` para `tokenable` viram UUID. O model do Sanctum não usa `HasUuids`.
- **Spatie's Permission/Role** precisam de subclasses locais (`App\Models\Role`, `App\Models\Permission`) para usar `HasUuidV7`. O config `permission.php` aponta para essas.
- **Ao criar novo módulo, lembrar de adicionar as permissões no `RoleSeeder`** e re-executar `php artisan db:seed --class=RoleSeeder`. Sem isso o endpoint retorna 403 para todos.
- **`laravel/sanctum` e `spatie/laravel-permission` devem estar no `composer.json`** — se o vendor for recriado (container recreate), pacotes instalados manualmente somem.
- **O Dockerfile usa `--no-dev`** — dev dependencies (phpunit, faker) não estão na imagem. Para rodar testes use `make test` que instala as dev deps antes de executar.
- **Dev server do frontend pode travar** após o container do backend ser recriado — sintoma: páginas retornam HTTP 200 com body vazio. Correção: `docker compose restart frontend`.
- **`apiFetch` lança exceção em 5xx** — se a API retornar 500, o erro é capturado pelo `error.tsx` do dashboard em vez de causar crash no Server Component.
- **Server Components não podem mutar cookies** — quando precisar (ex: limpar token inválido), redirecione para uma route handler em `app/api/.../route.ts`.
- **Next.js 16 renomeou `middleware.ts` para `proxy.ts`** — mesma API, mesmo comportamento, nome novo.
- **`searchParams` e `params` agora são Promise** em Next.js 16 — precisam de `await`.
- **`Server Actions allowedOrigins`** em `next.config.ts` fica sob `experimental` (Next.js 16+).
- **nginx local:** `proxy_set_header Host $http_host` (não `$host`) — caso contrário a porta não é encaminhada, e o `x-forwarded-host` quebra a CSRF do Server Actions.
- **Categoria pai no form** — `new/page.tsx` e `[id]/edit/page.tsx` chamam `GET /categories?all=1` para popular o dropdown. O edit exclui a própria categoria da lista para evitar auto-referência.
- **`?all=1` em categorias, fornecedores e produtos** — suportam `?all=1` para retornar lista sem paginação (população de dropdowns). Limitados a **500 registros** no service (`->limit(500)`) para evitar queries ilimitadas quando o tenant crescer. Retornam apenas colunas necessárias (id, name, etc.). Se um tenant tiver mais de 500 itens, implementar autocomplete assíncrono (react-select com async) em vez de dropdown estático.
- **Produto tem relações carregadas no Resource** — `ProductResource` inclui `category` (id, name) e `supplier` (id, company_name) via `whenLoaded`. O service faz `with(['category:id,name', 'supplier:id,company_name'])` na lista. O controller faz `$product->load(...)` no show.
- **`is_low_stock`** — calculado no model (`isLowStock()`) e exposto no Resource como campo virtual. `true` quando `stock_quantity <= min_stock_quantity`.
- **Movimentações de estoque são imutáveis** — o endpoint só tem `index`, `store` e `show`. Nunca update ou delete. Usar `adjustment` para corrigir erros.
- **`StockMovementService::record()` usa transação + lock** — `DB::transaction` + `lockForUpdate` no produto garante consistência se duas requisições tentarem alterar o estoque ao mesmo tempo.
- **Tipo `adjustment` define valor absoluto** — ao contrário de `in` (soma) e `out` (subtrai), `adjustment` seta o `stock_quantity` direto no valor informado. Útil para contagem de inventário. Aceita `quantity = 0`.
- **`AuditService` é singleton** — registrado em `AppServiceProvider::register()`. Isso é obrigatório: o par de observers `updating`/`updated` usa o serviço para guardar os valores antigos entre os dois disparos via `queueUpdate()`/`dequeuePendingUpdate()`. Se não for singleton, o estado se perde.
- **`layout.tsx` é async** — faz `apiFetch('/auth/me')` para determinar `canAudit` e passa a prop para `SidebarNav`. O fetch é deduplicado pelo Next.js com a chamada idêntica em `SidebarUser`. Envolver em try-catch para não quebrar o layout se a chamada falhar.
- **`LogsActivity` nos models de domínio** — ao criar um novo model, adicionar a trait e definir `protected static string $auditModule = 'nome-do-modulo'`. Sem isso o módulo não aparece corretamente nos logs.
- **Audit logs são imutáveis** — a tabela `audit_logs` não tem `updated_at` (`const UPDATED_AT = null`) e não tem soft delete. Nunca adicionar update ou delete na `AuditLogPolicy`.
- **Vendas: estoque sai no `create` (status pending)** — não no pagamento. Cancelamento devolve o estoque (StockMovement tipo `in`). Toda escrita de estoque passa pelo `InventoryService` (`decreaseForOrder`/`restoreForOrder`), nunca pelo `OrderService` direto.
- **Vendas é orientado a eventos** — `OrderService` despacha `OrderCreated`/`OrderPaid`/`OrderCancelled` e NÃO cria `FinancialTransaction`. O listener `GenerateFinancialTransactions` (auto-descoberto) delega ao `FinancialTransactionService`. Ver [`docs/arquitetura/vendas-eventos.md`](../arquitetura/vendas-eventos.md).
- **Listeners são SÍNCRONOS de propósito** — não marcar `ShouldQueue` antes de propagar o tenant para os jobs (o global scope depende de `auth()`, ausente em fila). Eventos despachados dentro da transação → atomicidade preservada.
- **Deptrac trava as fronteiras no CI** (`backend/deptrac.yaml`) — `Services` pode chamar `InventoryService`/`FinancialService` mas não pode tocar nos models `StockMovement`/`FinancialTransaction`; escrever `FinancialTransaction` é exclusivo do `FinancialTransactionService`. Padrões `classNameRegex` exigem delimitador (`#...#`).
- **`OrderService` recebe DTOs** — Controller monta `CreateOrderDTO`/`PayOrderDTO` via `fromArray($request->validated())`. Services não recebem array solto nem `Request`.
- **Achado: `CancelOrderFinancials` é no-op hoje** — `cancel()` só aceita pedidos `pending`, que ainda não têm `FinancialTransaction`. Seam mantido para futuro estorno de pedido pago (refund).
- **`OrderService::create()` usa `unit_price` do item** — se o campo for enviado na requisição, é usado como preço de venda (permite desconto por item no PDV). Se não enviado, usa `$product->sale_price`. A subtotal é calculada com o mesmo preço.
- **Parcelamento cria N `FinancialTransaction`s** (no listener `GenerateFinancialTransactions`) — 1 parcela = status `paid`; >1 parcelas = status `pending`. Datas mensais consecutivas a partir de hoje (mês 0). `StoreOrderRequest` valida `installments` entre 1 e 12 e aceita `payment_method` como nullable (pode pagar depois via `/orders/{id}/pay`).
- **SaleForm usa hidden inputs para estado** — `discount_type`, `discount_amount`, `payment_method`, `installments` e `cart` (JSON) são campos hidden atualizados por state React. A server action deserializa o JSON do campo `cart`.
- **Pay/Cancel são modais client components** — `pay-form.tsx` e `cancel-form.tsx` renderizam botão que abre modal overlay com `fixed inset-0`. Usam `useActionState` com as server actions `paySaleAction`/`cancelSaleAction`.
- **`DashboardController` usa `$this->authorize('dashboard.view')` sem Policy** — para endpoints de agregação sem model associado, o padrão é checar a Gate ability diretamente (Spatie registra cada permission como Gate). Não existe DashboardPolicy; a string `'dashboard.view'` é suficiente. Isso é diferente dos outros controllers que usam `$this->authorize('viewAny', Model::class)`.
- **`DashboardController` retorna `response()->json()` diretamente** — exceção aceita: endpoints de agregação não têm model, então não há JsonResource correspondente. O formato ainda segue a convenção `{ "data": {...} }`.
- **Dashboard usa `useRouter().push()` em vez de form GET** — o seletor de período é um componente client que usa `useRouter` para navegação instantânea. Isso é uma exceção ao padrão de filtros por `<form method="GET">` dos módulos de listagem; adequado aqui pois os filtros de período têm lógica condicional (campos de data só aparecem no modo `custom`).
- **Relatórios são camada Deptrac própria** (`ReportService`) — leitura-apenas com acesso a `FinancialModel` (e futuramente `InventoryModel`). Outros services continuam proibidos de tocar nesses models. Quando criar nova consulta agregada cross-model, adicionar no `ReportService` ao invés de afrouxar a fronteira de `Services`.
- **CSV export no frontend usa route handler proxy** — `app/api/reports/export/route.ts` (GET) recebe `?type=sales|top-products|cash-flow|accounts` + filtros, chama a API com `Bearer ${token}` do cookie e repassa o stream com `Content-Disposition`. O browser não acessa `API_BASE_URL` (interno), por isso o proxy.
- **`ReportController` retorna `JsonResponse|StreamedResponse`** — quando `?format=csv` está presente, devolve `streamDownload` com BOM UTF-8 (`\xEF\xBB\xBF`) para o Excel renderizar acentos. Cada relatório define cabeçalhos e callback de linha próprios.

---

## Estado atual

**Pronto:**
- Infraestrutura (Docker, nginx, SSL, CI/CD) nos 3 ambientes
- Autenticação (Sanctum + Spatie, login/logout/me)
- Schema do banco com 8 tabelas de domínio + establishments + sync_log + tabelas Spatie/Sanctum
- Migração para UUID v7 em todas as tabelas
- Multi-tenancy via `establishment_id` + global scope
- Arquitetura de camadas: Controllers/Api + Policies + Services + Resources
- CRUD completo de clientes (backend + frontend)
- CRUD completo de categorias (backend + frontend, suporte a subcategorias via `parent_id`)
- CRUD completo de fornecedores (backend + frontend, CNPJ único por tenant)
- CRUD completo de produtos (backend + frontend, SKU/barcode únicos por tenant, relações categoria/fornecedor, badge low_stock)
- Movimentação de estoque (in/out/adjustment, log imutável, transação atômica com lock, frontend com filtros e link "+ Mov." nos produtos)
- **Auditoria** (tabela `audit_logs` imutável, trait `LogsActivity` em todos os models de domínio, login/logout registrados, tela `/audit-logs` restrita ao admin com filtros por evento/módulo/período)
- **Vendas / PDV** (backend completo: OrderService com transação atômica, pay/cancel, geração de FinancialTransactions, estoque movimentado no create; frontend: lista paginada com filtros, PDV com busca de produto em campo de texto, carrinho editável, desconto fixo/%, pagamento com parcelamento, modal de pagamento e cancelamento na tela de detalhe)
- **`CustomerController` e `CustomerService`** suportam `?all=1` (clientes ativos, sem paginação) — usado nos dropdowns de vendas
- **Dashboard** (backend: `DashboardService::metrics()` agrega receita, pedidos por status, ticket médio, estoque crítico, últimas vendas; endpoint `GET /api/dashboard?period=today|week|month|custom`; autorizado via `dashboard.view` (todos os roles); frontend: 4 cards com variação %, breakdown de status, tabela de últimas vendas, lista de estoque crítico, seletor de período client-side)
- Layout do dashboard com sidebar, route group, loading skeletons
- Auth check na borda via `proxy.ts`
- **Testes automatizados**: 118 feature tests PHPUnit (backend, inclui `OrderTest` cobrindo create/pay/cancel + disparo de eventos) + 21 testes unitários Vitest (frontend) — `make test` roda a suite completa. Backend cobre auth, permissões, CRUD e isolamento multi-tenant. CI (`tests.yml`) roda a suíte + Deptrac e **trava o deploy** se algo quebrar.
- Error boundary no dashboard (`error.tsx`) + proteção 5xx no `apiFetch`
- Documentação completa em `docs/arquitetura/`

**Pendente (próximos passos):**
- ~~PDV web / Vendas~~ ✓ (concluído — carrinho, busca de produto, desconto, pagamento, parcelamento, cancelamento)
- ~~Dashboard~~ ✓ (concluído — métricas de vendas, estoque crítico, seletor de período)
- ~~Contas a pagar / receber (financeiro)~~ ✓ (backend + frontend + `finance:mark-overdue`)
- ~~Relatórios básicos~~ ✓ (vendas por período, top produtos, fluxo de caixa, contas a pagar/receber com CSV)
- Backup automatizado do MySQL em produção
- Middleware `AuditModuleAccess` para rotas sensíveis (relatórios, exportações)
- Comando `audit:prune` para retenção configurável (12 meses em prod via `AUDIT_RETENTION_DAYS`)

**Fase 2 (depois da Fase 1):**
- Observer que popula `sync_log` automaticamente
- Endpoints `POST /api/sync/push` e `GET /api/sync/pull`
- Empacotamento do backend para rodar on-premise como servidor local
- Painel de status de sincronização

---

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição |
|---|---|
| `APP_KEY` | Chave de criptografia do Laravel |
| `APP_URL` | URL base da API |
| `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | MySQL |
| `SANCTUM_STATEFUL_DOMAINS` | domínios autorizados |
| `SANCTUM_TOKEN_EXPIRATION` | minutos até expirar token (default 1440) |
| `CORS_ALLOWED_ORIGINS` | origins permitidos pela API |

### Frontend (`frontend/.env.local`)

| Variável | Descrição |
|---|---|
| `API_BASE_URL` | URL interna para Server Components chamarem a API (ex: `http://webserver:8001`) |
| `NEXT_PUBLIC_API_URL` | URL pública (cliente) — atualmente pouco usado, fetches server-side |

### GitHub Secrets

| Secret | Onde |
|---|---|
| `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` | ambos |
| `PROD_APP_KEY`, `PROD_APP_URL`, `PROD_DB_ROOT_PASSWORD`, `PROD_DB_PASSWORD`, `PROD_NEXT_PUBLIC_API_URL` | prod |
| `DEV_APP_KEY`, `DEV_APP_URL`, `DEV_DB_ROOT_PASSWORD`, `DEV_DB_PASSWORD` | dev |

---

## Convenções

- **Código e identificadores em inglês**; **documentação em PT-BR**; **commits em inglês** com prefixo (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **Branch ativo:** `dev`. Merge para `main` faz deploy de produção
- **Deploy em produção = PR `dev → main`** — quando solicitado a "enviar para produção" ou "fazer deploy em prod", o fluxo correto é: commit + push na `dev`, depois abrir um PR de `dev` para `main` via `gh pr create`. **Nunca fazer push direto em `main`.**
- **Nunca usar** `foreignId` em migrations novas — sempre `foreignUuid`
- **Nunca criar** model de domínio sem `BelongsToEstablishment`
- **Nunca chamar API direto** em Server Components — usar o helper `apiFetch`
- **Nunca passar `onClick` ou outros event handlers** como prop em componentes server — só client components podem ter handlers
