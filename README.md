# ERP Comercial

Sistema ERP comercial multi-tenant com arquitetura preparada para evolução **offline-first**. Atende lojas, restaurantes e adegas com módulos de cadastros, estoque, vendas (PDV) e financeiro.

> **Status atual:** Fase 1 em andamento — 5 módulos funcionando em produção. Veja o [roadmap](docs/arquitetura/roadmap.md) completo.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 13 (PHP 8.4 + FPM), MySQL 8.0 |
| Frontend | Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS |
| Autenticação | Laravel Sanctum (token-based) + Spatie Permission (RBAC) |
| Infra | Docker Compose, nginx, GitHub Actions (CI/CD) |
| Identificadores | UUID v7 em todas as tabelas |
| Testes | PHPUnit — 96 feature tests (backend) · Vitest — 21 unit tests (frontend) |

---

## Módulos implementados

| Módulo | Backend | Frontend | Testes |
|---|---|---|---|
| Autenticação | login, logout, me | tela de login, cookie token | — |
| Clientes | CRUD + filtros + paginação | lista, novo, editar, excluir | 18 |
| Categorias | CRUD + subcategorias + `?all=1` | lista, novo, editar, excluir | 22 |
| Fornecedores | CRUD + `?all=1` + CNPJ único/tenant | lista, novo, editar, excluir | 18 |
| Produtos | CRUD + `?all=1` + SKU/barcode únicos/tenant | lista, novo, editar, excluir | 21 |
| Estoque | in/out/adjustment + lock atômico | lista filtrada, registrar mov. | 15 |
| Vendas | migration + model | — | — |
| Financeiro | migration + model | — | — |

---

## Rodando localmente

```bash
git clone https://github.com/Sr-Ryuk/erp-lambadega.git
cd erp-lambadega
cp backend/.env.example backend/.env
docker compose up -d --build
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate:fresh --seed
```

Acesse:

- **Frontend:** http://localhost:8000
- **API:** http://localhost:8001/api
- **Credenciais iniciais:** `admin@inovabi.com` / `password`

### Atalhos (Makefile)

```bash
make test           # roda a suite completa (backend + frontend)
make test-backend   # 96 feature tests PHPUnit (SQLite in-memory, ~5s)
make test-frontend  # 21 unit tests Vitest
make migrate        # php artisan migrate
make seed           # php artisan db:seed --class=RoleSeeder
make fresh          # migrate:fresh --seed
make shell          # bash no container backend
make logs           # docker compose logs -f backend
```

Para detalhes (troubleshooting, hot-reload), veja [docs/tutoriais/rodar-local.md](docs/tutoriais/rodar-local.md).

---

## Ambientes

| Ambiente | URL | Branch | Deploy |
|---|---|---|---|
| Local | http://localhost:8000 | qualquer | manual |
| Dev | https://dev.inovabi.com | `dev` | automático (push) |
| Produção | https://inovabi.com | `main` | automático (PR `dev → main`) |

O CI/CD está em [`.github/workflows/`](.github/workflows). Veja [docs/tutoriais/deploy.md](docs/tutoriais/deploy.md) para detalhes.

---

## Estrutura do repositório

```
erp-comercial/
├── backend/
│   ├── app/
│   │   ├── Models/Concerns/      # HasUuidV7, BelongsToEstablishment
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # Sem lógica de negócio — só HTTP
│   │   │   ├── Requests/         # Validação por módulo (escopo multi-tenant)
│   │   │   └── Resources/        # Transformação JSON (JsonResource)
│   │   ├── Policies/             # Autorização acoplada ao model (auto-descoberta)
│   │   └── Services/             # Regras de negócio, queries, transações
│   ├── database/
│   │   ├── migrations/           # UUID v7 + establishment_id em tudo
│   │   ├── factories/            # EstablishmentFactory, UserFactory + 5 módulos
│   │   └── seeders/RoleSeeder.php  # 4 roles, 29+ permissões (idempotente)
│   ├── tests/Feature/Api/        # 96 testes (SQLite in-memory)
│   └── routes/api.php
│
├── frontend/
│   ├── proxy.ts                  # Auth check na borda (Next.js 16)
│   ├── vitest.config.ts          # Config de testes unitários
│   └── app/
│       ├── (dashboard)/          # Route group — rotas autenticadas
│       │   ├── __tests__/        # 21 testes Vitest para buildBody dos 5 módulos
│       │   ├── customers/        # CRUD + build-body.ts
│       │   ├── categories/       # CRUD + subcategorias + build-body.ts
│       │   ├── suppliers/        # CRUD + build-body.ts
│       │   ├── products/         # CRUD + link "+ Mov." p/ estoque + build-body.ts
│       │   └── stock-movements/  # Registrar + histórico filtrado + build-body.ts
│       ├── lib/api.ts            # apiFetch (injeta token, trata 401/403/5xx)
│       ├── lib/types.ts          # Interfaces TypeScript de todos os modelos
│       └── ui/skeletons.tsx      # TableSkeleton, FormSkeleton
│
├── docs/
│   ├── arquitetura/              # Visão de longo prazo, decisões técnicas, roadmap
│   ├── banco-de-dados/           # Schema por módulo
│   ├── tutoriais/                # Como rodar e deployar
│   └── ia/contexto.md            # Contexto completo para agentes de IA
│
├── Makefile                      # Atalhos de desenvolvimento
├── docker-compose.yml            # Local
├── docker-compose.dev.yml        # Dev (VPS)
└── docker-compose.prod.yml       # Produção (VPS)
```

---

## Arquitetura

A arquitetura é desenhada em três fases. Leia antes de implementar qualquer módulo novo.

- [Visão geral](docs/arquitetura/visao-geral.md) — modelo hub-and-spoke, fases de evolução
- [Multi-tenant](docs/arquitetura/multi-tenant.md) — isolamento por estabelecimento via global scope
- [Identificadores](docs/arquitetura/identificadores.md) — por que UUID v7 em todas as tabelas
- [Sincronização](docs/arquitetura/sincronizacao.md) — protocolo de sync entre central e local (Fase 2)
- [Roadmap](docs/arquitetura/roadmap.md) — o que está pronto, em andamento e planejado
- [Contexto IA](docs/ia/contexto.md) — guia completo para agentes de IA

---

## Convenções

- **Código e identificadores em inglês**; **documentação em PT-BR**; **commits em inglês** com prefixo (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **Deploy em produção = PR `dev → main`** — nunca push direto em `main`
- **Arquitetura de camadas:** `Controllers/Api` (só HTTP) → `Services` (negócio) → `Resources` (output)
- **Todo model de domínio** usa `HasUuidV7` + `BelongsToEstablishment`
- **Migrations** sempre usam `foreignUuid`, nunca `foreignId`
- **Ao criar módulo novo:** adicionar permissões no `RoleSeeder` e re-executar `make seed`
- **Frontend:** `apiFetch` para todas as chamadas em Server Components; Server Actions em `actions.ts`

---

## Licença

Proprietário — Inovabi.
