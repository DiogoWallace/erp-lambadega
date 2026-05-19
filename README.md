# ERP Comercial

Sistema ERP comercial multi-tenant com arquitetura preparada para evolução **offline-first**. Atende lojas, restaurantes e adegas com módulos de cadastros, estoque, vendas (PDV) e financeiro.

> **Status atual:** Fase 1 — sistema web em construção. Veja o [roadmap](docs/arquitetura/roadmap.md) completo.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Laravel 13 (PHP 8.4 + FPM), MySQL 8.0 |
| Frontend | Next.js 16 (App Router, Server Actions), TypeScript, Tailwind CSS |
| Autenticação | Laravel Sanctum (token-based) + Spatie Permission (RBAC) |
| Infra | Docker Compose, nginx, GitHub Actions (CI/CD) |
| Identificadores | UUID v7 em todas as tabelas |

---

## Estrutura do repositório

```
erp-comercial/
├── backend/                  # API Laravel
│   ├── app/
│   │   ├── Models/
│   │   │   └── Concerns/     # Traits: HasUuidV7, BelongsToEstablishment
│   │   ├── Http/
│   │   │   ├── Controllers/Api/  # Controllers de domínio (sem lógica de negócio)
│   │   │   ├── Requests/         # Validação por módulo
│   │   │   └── Resources/        # Transformação do output JSON
│   │   └── Services/         # Regras de negócio e queries
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
├── frontend/                 # Next.js 16
│   ├── app/
│   │   ├── (dashboard)/      # Route group: rotas autenticadas
│   │   │   ├── customers/    # CRUD completo
│   │   │   ├── categories/   # CRUD completo
│   │   │   └── dashboard/
│   │   ├── api/auth/clear/   # Route handler para limpar cookie inválido
│   │   ├── lib/              # api.ts, types.ts
│   │   ├── ui/               # skeletons reutilizáveis
│   │   └── login/
│   └── proxy.ts              # Auth check na borda
│
├── docs/                     # Documentação do projeto
│   ├── arquitetura/          # Visão de longo prazo, decisões técnicas
│   ├── banco-de-dados/       # Schema por módulo
│   ├── tutoriais/            # Como rodar e deployar
│   └── ia/                   # Contexto para agentes de IA
│
├── nginx/conf.d/             # Configurações por ambiente
├── docker-compose.yml        # Ambiente local
├── docker-compose.dev.yml    # Ambiente dev (VPS)
└── docker-compose.prod.yml   # Ambiente produção (VPS)
```

---

## Módulos implementados

| Módulo | Backend | Frontend |
|---|---|---|
| Autenticação | login, logout, me | tela de login, cookie token |
| Clientes | CRUD + filtros + paginação | lista, novo, editar, excluir |
| Categorias | CRUD + subcategorias + filtros | lista, novo, editar, excluir |
| Fornecedores | migration + model | — |
| Produtos | migration + model | — |
| Estoque | migration + model | — |
| Vendas | migration + model | — |
| Financeiro | migration + model | — |

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

Para detalhes (troubleshooting, comandos úteis, hot-reload), veja [docs/tutoriais/rodar-local.md](docs/tutoriais/rodar-local.md).

---

## Ambientes

| Ambiente | URL | Branch | Deploy |
|---|---|---|---|
| Local | http://localhost:8000 | qualquer | manual |
| Dev | https://dev.inovabi.com | `dev` | automático (push) |
| Produção | https://inovabi.com | `main` | automático (push) |

O CI/CD está em [`.github/workflows/`](.github/workflows). Veja [docs/tutoriais/deploy.md](docs/tutoriais/deploy.md) para detalhes.

---

## Documentação

### Arquitetura

A arquitetura é desenhada em três fases. Leia antes de implementar qualquer módulo novo.

- [Visão geral](docs/arquitetura/visao-geral.md) — modelo hub-and-spoke, fases de evolução
- [Multi-tenant](docs/arquitetura/multi-tenant.md) — isolamento por estabelecimento via global scope
- [Identificadores](docs/arquitetura/identificadores.md) — por que UUID v7 em todas as tabelas
- [Sincronização](docs/arquitetura/sincronizacao.md) — protocolo de sync entre central e local (Fase 2)
- [Roadmap](docs/arquitetura/roadmap.md) — o que está pronto, em andamento e planejado

### Banco de dados

Schema de cada módulo com colunas, índices e relacionamentos.

- [Autenticação](docs/banco-de-dados/autenticacao.md) — users, roles, permissions, tokens
- [Clientes e fornecedores](docs/banco-de-dados/clientes-fornecedores.md)
- [Catálogo e estoque](docs/banco-de-dados/catalogo-estoque.md)
- [Vendas](docs/banco-de-dados/vendas.md)
- [Financeiro](docs/banco-de-dados/financeiro.md)

### Tutoriais

- [Rodar localmente](docs/tutoriais/rodar-local.md)
- [Deploy](docs/tutoriais/deploy.md)

---

## Convenções

- **Código e identificadores em inglês**; **documentação em PT-BR**; **commits em inglês** com prefixo (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **Branches:** `dev` é o branch ativo; PRs vão para `dev`; merge de `dev` → `main` dispara deploy de produção
- **Arquitetura de camadas:** `Controllers/Api` (só HTTP) → `Services` (negócio) → `Resources` (output)
- **Todo model de domínio** usa `HasUuidV7` + `BelongsToEstablishment`
- **Migrations** sempre usam `foreignUuid`, nunca `foreignId`
- **Ao criar módulo novo:** adicionar permissões no `RoleSeeder` — sem isso o endpoint retorna 403
- **Frontend:** `apiFetch` para todas as chamadas em Server Components; Server Actions em `actions.ts`

---

## Licença

Proprietário — Inovabi.
