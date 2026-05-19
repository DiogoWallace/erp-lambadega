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
│   │   │   ├── Controllers/
│   │   │   └── Requests/
│   │   └── Providers/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── config/
│   └── routes/api.php
│
├── frontend/                 # Next.js
│   ├── app/
│   │   ├── (dashboard)/      # Route group: rotas autenticadas
│   │   │   ├── customers/
│   │   │   └── dashboard/
│   │   ├── api/auth/clear/   # Route handler para limpar cookie inválido
│   │   ├── lib/              # api.ts, types.ts
│   │   ├── ui/               # skeletons reutilizáveis
│   │   └── login/
│   └── proxy.ts              # Auth check na borda (antigo middleware)
│
├── docs/                     # Documentação do projeto
│   ├── arquitetura/          # Visão de longo prazo, decisões técnicas
│   ├── banco-de-dados/       # Schema por módulo
│   ├── tutoriais/            # Como rodar e deployar
│   └── ia/                   # Contexto pra agentes de IA
│
├── nginx/conf.d/             # Configurações por ambiente
├── scripts/                  # Utilitários (setup de secrets, etc.)
│
├── docker-compose.yml        # Ambiente local
├── docker-compose.dev.yml    # Ambiente dev (VPS)
└── docker-compose.prod.yml   # Ambiente produção (VPS)
```

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

- **Código e identificadores em inglês**; **comentários e documentação em PT-BR**
- **Commits em inglês**, prefixados (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`)
- **Branches:** `dev` é o branch ativo de desenvolvimento; `main` é o reflexo de produção
- **PRs:** contra `dev`; merge para `main` dispara deploy de produção
- **Migrations sempre adicionam `establishment_id`** em tabelas de domínio
- **Models de domínio sempre usam** `HasUuidV7` + `BelongsToEstablishment`
- **Frontend:** route group `(dashboard)/` agrupa rotas autenticadas; o `proxy.ts` faz o auth check na borda

---

## Licença

Proprietário — Inovabi.
