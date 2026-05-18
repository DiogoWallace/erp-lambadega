# Guia de Deploy

## Como funciona

O deploy é **automático via GitHub Actions**:

| Push em | Ambiente | URLs |
|---------|----------|------|
| `dev`   | Dev      | https://dev.inovabi.com · https://api-dev.inovabi.com |
| `main`  | Prod     | https://inovabi.com · https://api.inovabi.com |

O workflow conecta na VPS via SSH, atualiza o código, rebuilda os containers, roda as migrations e verifica se o backend está de pé.

---

## Fluxo correto de deploy

```
1. Crie uma branch a partir de dev
   git checkout dev
   git checkout -b feature/minha-feature

2. Desenvolva e teste localmente

3. Abra PR: feature/* → dev
   - Merge → dispara deploy automático no ambiente dev
   - Valide em https://dev.inovabi.com

4. Quando validado, abra PR: dev → main
   - Merge → dispara deploy automático em produção
```

**Nunca faça push direto em `main`.**

---

## O que o workflow faz (passo a passo)

1. Conecta na VPS via SSH
2. Clona o repo (se não existir) ou faz `git pull`
3. Gera `backend/.env` (ou `.env.dev`) com os valores dos GitHub Secrets
4. Exporta as variáveis do banco para o Docker Compose
5. Executa `docker compose up -d --build`
   - O MySQL aguarda ficar saudável (healthcheck) antes do backend subir
6. Executa `php artisan migrate --force`
7. Limpa e regenera os caches (config, route, view)
8. Recarrega o nginx
9. Verifica se o Laravel está respondendo via `php artisan about`

---

## Configuração inicial da VPS (fazer uma vez)

### 1. Clonar o repositório de prod

```bash
git clone -b main https://github.com/Sr-Ryuk/erp-lambadega /var/www/erp
```

### 2. Criar a rede Docker compartilhada

```bash
docker network create erp_shared
# Obs: o docker-compose.prod.yml recria automaticamente com 'name: erp_shared'
# Este passo pode ser pulado se rodar o compose antes
```

### 3. Emitir o certificado SSL (uma única vez)

```bash
cd /var/www/erp
bash init-ssl.sh
```

O script:
- Ativa uma config nginx HTTP-only temporária
- Emite o cert Let's Encrypt para os 4 domínios
- Restaura a config SSL completa
- Recarrega o nginx

**Pré-requisito**: os registros DNS dos 4 domínios devem apontar para o IP da VPS antes de rodar.

### 4. Configurar os GitHub Secrets

Via script automatizado:
```bash
# Edite as variáveis no topo do script antes de rodar
bash scripts/setup-github-secrets.sh
```

Ou manualmente no GitHub em Settings → Secrets → Actions:

| Secret                  | Onde encontrar / como gerar            |
|-------------------------|----------------------------------------|
| `VPS_HOST`              | IP público da VPS                      |
| `VPS_USER`              | `root` (ou usuário SSH configurado)    |
| `VPS_SSH_KEY`           | Conteúdo da chave privada SSH          |
| `PROD_APP_KEY`          | `php artisan key:generate --show`      |
| `PROD_APP_URL`          | `https://api.inovabi.com`              |
| `PROD_DB_ROOT_PASSWORD` | Senha forte (gerar aleatoriamente)     |
| `PROD_DB_PASSWORD`      | Senha forte (gerar aleatoriamente)     |
| `PROD_NEXT_PUBLIC_API_URL` | `https://api.inovabi.com`           |
| `DEV_APP_KEY`           | `php artisan key:generate --show`      |
| `DEV_APP_URL`           | `https://api-dev.inovabi.com`          |
| `DEV_DB_ROOT_PASSWORD`  | Senha forte                            |
| `DEV_DB_PASSWORD`       | Senha forte                            |

---

## Renovação do certificado SSL

Automática — o serviço `certbot` no `docker-compose.prod.yml` verifica e renova a cada 12h.

Para forçar a renovação manualmente:

```bash
cd /var/www/erp
docker compose -f docker-compose.prod.yml run --rm --entrypoint certbot certbot renew
docker compose -f docker-compose.prod.yml exec webserver nginx -s reload
```

---

## Comandos úteis na VPS

```bash
# Ver status dos containers (prod)
docker compose -f /var/www/erp/docker-compose.prod.yml ps

# Ver status dos containers (dev)
docker compose -f /var/www/erp-dev/docker-compose.dev.yml ps

# Logs do backend prod
docker logs erp-backend-1 -f

# Logs do backend dev
docker logs backend_dev -f

# Rodar artisan manualmente em prod
docker exec erp-backend-1 php artisan <comando>

# Rodar artisan manualmente em dev
docker exec backend_dev php artisan <comando>

# Recarregar nginx após mudança de config
docker exec erp-webserver-1 nginx -s reload

# Ver certificado SSL
openssl x509 -in /var/www/erp/certbot/conf/live/inovabi.com/fullchain.pem -noout -dates
```

---

## Troubleshooting

| Sintoma | Causa provável | Solução |
|---------|---------------|---------|
| Migration falha com "Connection refused" | MySQL não está pronto | O healthcheck resolve automaticamente; se persistir, verifique `docker logs db_dev` |
| Deploy falha com "i/o timeout" no SSH | Conexão SSH caiu durante build | Re-rodar o workflow; `request_pty: true` está configurado para evitar |
| HTTPS não responde | Cert SSL não emitido | Rodar `init-ssl.sh` na VPS |
| `nginx -s reload` falha silenciosamente | Config inválida ou cert ausente | Verificar `docker exec erp-webserver-1 nginx -t` |
| Health check falha após artisan | Caches corrompidos | `docker exec backend_dev php artisan config:clear` |
