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
│   │   │   │   └── BelongsToEstablishment.php  global scope + creating hook
│   │   │   ├── Establishment.php         tenant root
│   │   │   ├── User.php                  HasUuidV7 + HasRoles + HasApiTokens
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
│   │   │   │       ├── ProductController.php   suporta ?all=1
│   │   │   │       └── StockMovementController.php  só index/store/show (log imutável)
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
│   │   │       └── StockMovementResource.php  inclui product e user via whenLoaded
│   │   ├── Services/                    regras de negócio (queries, CRUD)
│   │   │   ├── CustomerService.php
│   │   │   ├── CategoryService.php
│   │   │   ├── SupplierService.php
│   │   │   ├── ProductService.php       filtros: search, category_id, supplier_id, is_active, low_stock
│   │   │   └── StockMovementService.php record() usa DB::transaction + lockForUpdate
│   │   └── Providers/AppServiceProvider.php
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
│   │       └── RoleSeeder.php            4 roles, 29+ permissions (idempotente)
│   ├── tests/
│   │   ├── TestCase.php                  RefreshDatabase + seed(RoleSeeder) + helpers
│   │   ├── Feature/
│   │   │   └── Api/
│   │   │       ├── CustomerTest.php      auth, permissões, CRUD, multi-tenant
│   │   │       ├── CategoryTest.php      + slug, parent_id, ?all=1
│   │   │       ├── SupplierTest.php      + CNPJ único por establishment
│   │   │       ├── ProductTest.php       + SKU/barcode únicos, filtro low_stock, category_id de outro tenant
│   │   │       └── StockMovementTest.php in/out/adjustment, estoque insuficiente, isolamento multi-tenant
│   │   └── Unit/
│   ├── phpunit.xml                       SQLite in-memory para testes rápidos
│   ├── config/
│   │   ├── permission.php                aponta para App\Models\{Role,Permission}
│   │   ├── sanctum.php
│   │   └── cors.php
│   └── routes/api.php
│
├── frontend/                             Next.js 16
│   ├── proxy.ts                          auth check na borda (antigo middleware)
│   ├── app/
│   │   ├── (dashboard)/                  ROUTE GROUP — não aparece na URL
│   │   │   ├── layout.tsx                sync; sidebar + Suspense para user
│   │   │   ├── sidebar-nav.tsx           client component (usePathname)
│   │   │   ├── sidebar-user.tsx          async; redireciona se 401
│   │   │   ├── actions.ts                logoutAction
│   │   │   ├── dashboard/page.tsx        rota: /dashboard
│   │   │   ├── customers/                rota: /customers
│   │   │   │   ├── page.tsx              lista server-side
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   ├── customer-form.tsx     client; useActionState
│   │   │   │   ├── delete-button.tsx     client; confirm() + form action
│   │   │   │   └── actions.ts            create/update/delete
│   │   │   ├── error.tsx                 error boundary do dashboard (client)
│   │   │   ├── categories/               rota: /categories
│   │   │   │   ├── page.tsx              lista server-side
│   │   │   │   ├── new/page.tsx          recebe lista p/ dropdown de pai
│   │   │   │   ├── [id]/edit/page.tsx    exclui a própria categoria do dropdown
│   │   │   │   ├── category-form.tsx     client; useActionState
│   │   │   │   ├── delete-button.tsx     client; confirm() + form action
│   │   │   │   └── actions.ts            create/update/delete
│   │   │   ├── suppliers/                rota: /suppliers
│   │   │   │   ├── page.tsx              lista; formata CNPJ
│   │   │   │   ├── new/page.tsx
│   │   │   │   ├── [id]/edit/page.tsx
│   │   │   │   ├── supplier-form.tsx     4 seções: empresa, contato, endereço, notas
│   │   │   │   ├── delete-button.tsx
│   │   │   │   └── actions.ts
│   │   │   ├── products/                 rota: /products
│   │   │   │   ├── page.tsx              lista; filtros: search, categoria, status, low_stock; link "+ Mov."
│   │   │   │   ├── new/page.tsx          carrega categorias + fornecedores p/ dropdowns
│   │   │   │   ├── [id]/edit/page.tsx    carrega produto + categorias + fornecedores
│   │   │   │   ├── product-form.tsx      4 seções: informações, preços, estoque/id, descrição
│   │   │   │   ├── delete-button.tsx
│   │   │   │   └── actions.ts
│   │   │   └── stock-movements/          rota: /stock-movements
│   │   │       ├── page.tsx              lista; filtros: produto, tipo, datas; badges coloridos
│   │   │       ├── new/page.tsx          aceita ?product_id= para pré-preencher produto
│   │   │       ├── movement-form.tsx     client; campo cost_price condicional (só para "in")
│   │   │       └── actions.ts            createStockMovementAction; redireciona filtrado por produto
│   │   ├── api/auth/clear/route.ts       limpa cookie inválido
│   │   ├── lib/
│   │   │   ├── api.ts                    apiFetch (token do cookie)
│   │   │   └── types.ts                  Customer, Category, Supplier, Product, StockMovement, PaginatedResponse
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

class Foo extends Model
{
    use BelongsToEstablishment, HasFactory, HasUuidV7, SoftDeletes;
}
```

- `HasUuidV7` — gera UUID v7 como PK
- `BelongsToEstablishment` — global scope (filtra queries por `establishment_id` do user logado) + creating hook (preenche o campo automaticamente)
- Inclua `'establishment_id'` no `#[Fillable]` (para que seeders funcionem)

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
- `Services/FooService` — regras de negócio, queries, paginação, CRUD.
- `Resources/FooResource` — transforma o model em JSON (substitui `response()->json()` manual).
- `Requests/Foo/{Store,Update}FooRequest` — validação com escopo multi-tenant.

```php
// Controller enxuto
public function index(Request $request): AnonymousResourceCollection
{
    abort_if($request->user()->cannot('foo.view'), 403, 'Sem permissão.');
    return FooResource::collection($this->service->paginate($request->only(['search', 'is_active'])));
}
```

**Permissões** verificadas no controller (antes de chamar o service):

```php
abort_if($request->user()->cannot('customers.view'), 403, 'Sem permissão.');
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
- **`?all=1` em categorias e fornecedores** — ambos os endpoints suportam `?all=1` para retornar lista completa (sem paginação). Usado pelos formulários de produto que precisam popular dropdowns de categoria e fornecedor.
- **Produto tem relações carregadas no Resource** — `ProductResource` inclui `category` (id, name) e `supplier` (id, company_name) via `whenLoaded`. O service faz `with(['category:id,name', 'supplier:id,company_name'])` na lista. O controller faz `$product->load(...)` no show.
- **`is_low_stock`** — calculado no model (`isLowStock()`) e exposto no Resource como campo virtual. `true` quando `stock_quantity <= min_stock_quantity`.
- **Movimentações de estoque são imutáveis** — o endpoint só tem `index`, `store` e `show`. Nunca update ou delete. Usar `adjustment` para corrigir erros.
- **`StockMovementService::record()` usa transação + lock** — `DB::transaction` + `lockForUpdate` no produto garante consistência se duas requisições tentarem alterar o estoque ao mesmo tempo.
- **Tipo `adjustment` define valor absoluto** — ao contrário de `in` (soma) e `out` (subtrai), `adjustment` seta o `stock_quantity` direto no valor informado. Útil para contagem de inventário. Aceita `quantity = 0`.

---

## Estado atual

**Pronto:**
- Infraestrutura (Docker, nginx, SSL, CI/CD) nos 3 ambientes
- Autenticação (Sanctum + Spatie, login/logout/me)
- Schema do banco com 8 tabelas de domínio + establishments + sync_log + tabelas Spatie/Sanctum
- Migração para UUID v7 em todas as tabelas
- Multi-tenancy via `establishment_id` + global scope
- Arquitetura de camadas: Controllers/Api + Services + Resources
- CRUD completo de clientes (backend + frontend)
- CRUD completo de categorias (backend + frontend, suporte a subcategorias via `parent_id`)
- CRUD completo de fornecedores (backend + frontend, CNPJ único por tenant)
- CRUD completo de produtos (backend + frontend, SKU/barcode únicos por tenant, relações categoria/fornecedor, badge low_stock)
- Movimentação de estoque (in/out/adjustment, log imutável, transação atômica com lock, frontend com filtros e link "+ Mov." nos produtos)
- Layout do dashboard com sidebar, route group, loading skeletons
- Auth check na borda via `proxy.ts`
- **Testes automatizados**: 96 feature tests PHPUnit cobrindo auth, permissões, CRUD e isolamento multi-tenant para todos os 5 módulos (SQLite in-memory, ~5s — `make test`)
- Error boundary no dashboard (`error.tsx`) + proteção 5xx no `apiFetch`
- Documentação completa em `docs/arquitetura/`

**Pendente (próximos passos):**
- PDV web / Vendas (carrinho, desconto, fechamento)
- Contas a pagar / receber (financeiro)
- Relatórios básicos (vendas por período, top produtos, fluxo de caixa)
- Backup automatizado do MySQL em produção

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
