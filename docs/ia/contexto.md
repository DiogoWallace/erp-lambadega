# Contexto do Projeto — ERP Comercial

## Visão Geral

ERP comercial em desenvolvimento. Backend em Laravel (API REST), frontend em Next.js. Infraestrutura 100% containerizada com Docker, hospedada em uma VPS Hostinger com deploy automático via GitHub Actions.

---

## Stack

| Camada      | Tecnologia              | Versão  |
|-------------|-------------------------|---------|
| Backend     | Laravel (PHP-FPM)       | 13.x    |
| Frontend    | Next.js                 | 20 (Node)|
| Banco       | MySQL                   | 8.0     |
| Web server  | nginx                   | alpine  |
| Container   | Docker + Compose        | v2      |
| CI/CD       | GitHub Actions          | —       |
| SSL         | Let's Encrypt (certbot) | —       |

---

## Ambientes

| Ambiente | Branch | Frontend              | API                      |
|----------|--------|-----------------------|--------------------------|
| Local    | —      | http://localhost:8000 | http://localhost:8001    |
| Dev      | `dev`  | https://dev.inovabi.com | https://api-dev.inovabi.com |
| Prod     | `main` | https://inovabi.com   | https://api.inovabi.com  |

---

## Estrutura do Repositório

```
erp-comercial/
├── backend/                  # Laravel 13
│   ├── app/
│   │   ├── Http/Controllers/
│   │   └── Models/
│   ├── database/
│   │   └── migrations/
│   ├── routes/
│   │   ├── web.php
│   │   └── api.php           # criar conforme módulos
│   ├── .env.example          # referência de variáveis
│   └── Dockerfile
│
├── frontend/                 # Next.js (App Router)
│   ├── app/
│   │   └── page.tsx
│   └── Dockerfile            # multi-stage: builder → prod
│
├── nginx/conf.d/
│   ├── default.conf          # SSL prod+dev (4 domínios)
│   ├── local.conf            # HTTP local (portas 8000/8001)
│   └── bootstrap.conf        # HTTP-only para emissão inicial de cert
│
├── docker-compose.yml        # ambiente local
├── docker-compose.dev.yml    # ambiente dev (VPS, rede erp_shared)
├── docker-compose.prod.yml   # ambiente prod (VPS, cria rede erp_shared)
│
├── .github/workflows/
│   ├── deploy.yml            # push em main → deploy prod
│   └── deploy-dev.yml        # push em dev → deploy dev
│
├── init-ssl.sh               # emissão inicial do cert Let's Encrypt
├── scripts/
│   └── setup-github-secrets.sh  # configura secrets do repositório via gh CLI
│
└── docs/
    ├── ia/                   # contexto para IA
    └── tutoriais/            # guias de desenvolvimento
```

---

## Arquitetura de Rede (VPS)

```
Internet
    │
    ▼
nginx (erp-webserver-1)   ← porta 80/443 exposta
    │         │
    │         ├── api.inovabi.com     → fastcgi → erp-backend-1:9000   (prod)
    │         ├── inovabi.com         → proxy   → erp-frontend-1:3000  (prod)
    │         ├── api-dev.inovabi.com → fastcgi → backend_dev:9000     (dev)
    │         └── dev.inovabi.com     → proxy   → frontend_dev:3000    (dev)
    │
    └── Rede Docker: erp_shared
            ├── erp-backend-1    (PHP-FPM, prod)
            ├── erp-frontend-1   (Next.js, prod)
            ├── erp-db-1         (MySQL, prod)
            ├── backend_dev      (PHP-FPM, dev)
            ├── frontend_dev     (Next.js, dev)
            └── db_dev           (MySQL, dev)
```

- O compose de prod **cria** a rede `erp_shared`.
- O compose de dev **entra** na rede `erp_shared` como externa.
- O nginx do prod roteia os 4 domínios (prod + dev) num único container.

---

## Variáveis de Ambiente

### Backend (`backend/.env`)
| Variável         | Descrição                       |
|------------------|---------------------------------|
| `APP_KEY`        | Chave de criptografia do Laravel|
| `APP_URL`        | URL base da API                 |
| `DB_HOST`        | Hostname do container MySQL     |
| `DB_DATABASE`    | Nome do banco                   |
| `DB_USERNAME`    | Usuário do banco                |
| `DB_PASSWORD`    | Senha do banco                  |

### GitHub Secrets (CI/CD)
| Secret                  | Usado em    |
|-------------------------|-------------|
| `VPS_HOST`              | ambos       |
| `VPS_USER`              | ambos       |
| `VPS_SSH_KEY`           | ambos       |
| `PROD_APP_KEY`          | prod        |
| `PROD_APP_URL`          | prod        |
| `PROD_DB_ROOT_PASSWORD` | prod        |
| `PROD_DB_PASSWORD`      | prod        |
| `PROD_NEXT_PUBLIC_API_URL` | prod     |
| `DEV_APP_KEY`           | dev         |
| `DEV_APP_URL`           | dev         |
| `DEV_DB_ROOT_PASSWORD`  | dev         |
| `DEV_DB_PASSWORD`       | dev         |

---

## Convenções de Branch

| Branch  | Finalidade                        | Deploy automático |
|---------|-----------------------------------|-------------------|
| `main`  | Código estável de produção        | Sim → prod        |
| `dev`   | Integração e testes               | Sim → dev         |
| `feature/*` | Desenvolvimento de features   | Não               |

Fluxo: `feature/*` → PR para `dev` → validar → PR para `main`.

---

## Estado Atual do Sistema

- Infraestrutura: completa (Docker, nginx, SSL, CI/CD)
- Backend: scaffold padrão Laravel 13 (sem módulos de negócio ainda)
- Frontend: scaffold padrão Next.js (sem páginas de negócio ainda)
- Banco: apenas tabelas base (users, cache, jobs, sessions)
- Próximo passo: criar módulos do ERP (autenticação, clientes, produtos, etc.)
