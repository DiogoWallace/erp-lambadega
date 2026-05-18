# Rodando o Projeto Localmente

## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e rodando
- [Git](https://git-scm.com/)
- Porta `8000`, `8001` e `3306` livres na máquina

---

## Primeira vez

### 1. Clone o repositório

```bash
git clone https://github.com/Sr-Ryuk/erp-lambadega.git
cd erp-lambadega
git checkout dev
```

### 2. Crie o `.env` do backend

```bash
cp backend/.env.example backend/.env
```

O arquivo já vem pré-configurado para o ambiente local. Gere a `APP_KEY`:

```bash
docker compose run --rm backend php artisan key:generate --show
# Copie o valor e coloque em backend/.env → APP_KEY=base64:...
```

### 3. Suba os containers

```bash
docker compose up -d --build
```

### 4. Rode as migrations

```bash
docker compose exec backend php artisan migrate
```

---

## Acessos

| Serviço  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:8000      |
| API      | http://localhost:8001      |
| MySQL    | localhost:3306 (usuário: `erp_user`, senha: `localpass`) |

---

## Comandos do dia a dia

```bash
# Subir os containers
docker compose up -d

# Parar os containers
docker compose down

# Ver logs de um serviço
docker compose logs -f backend
docker compose logs -f frontend

# Rodar comando artisan
docker compose exec backend php artisan <comando>

# Criar migration
docker compose exec backend php artisan make:migration create_produtos_table

# Criar model com migration e controller
docker compose exec backend php artisan make:model Produto -mc

# Rodar migrations
docker compose exec backend php artisan migrate

# Rollback
docker compose exec backend php artisan migrate:rollback

# Limpar caches
docker compose exec backend php artisan config:clear
docker compose exec backend php artisan route:clear
docker compose exec backend php artisan cache:clear

# Acessar MySQL
docker compose exec db mysql -u erp_user -plocalpass erp_local_db
```

---

## Desenvolvimento com hot reload

O frontend já está configurado com hot reload — qualquer alteração em `frontend/app/` reflete imediatamente no browser.

O backend usa volume bind para `app/`, `routes/`, `config/`, `database/` e `resources/` — alterações nesses diretórios são refletidas sem precisar rebuildar o container.

---

## Reconstruindo do zero

Se precisar limpar tudo e começar do zero:

```bash
docker compose down -v   # remove containers E volumes (apaga o banco)
docker compose up -d --build
docker compose exec backend php artisan migrate
```
