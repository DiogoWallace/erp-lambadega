#!/bin/bash
set -e

# ─────────────────────────────────────────────
# CONFIGURAÇÕES — edite antes de rodar
# ─────────────────────────────────────────────
GITHUB_REPO="OWNER/REPO"          # ex: diogo/erp-comercial
VPS_HOST="IP_DA_VPS"              # IP público da VPS
VPS_USER="root"                   # usuário SSH
SSH_KEY_PATH="$HOME/.ssh/id_rsa"  # caminho da chave SSH privada

PROD_ENV_FILE="/var/www/erp/backend/.env"
DEV_ENV_FILE="/var/www/erp-dev/backend/.env"
PROD_FRONTEND_ENV="/var/www/erp/frontend/.env.local"
DEV_FRONTEND_ENV="/var/www/erp-dev/frontend/.env.local"
# ─────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

check() {
  if [ ! -f "$1" ]; then
    echo -e "${RED}Arquivo não encontrado: $1${NC}"
    exit 1
  fi
}

get_env() {
  grep "^$2=" "$1" | cut -d'=' -f2- | tr -d '"' | tr -d "'"
}

set_secret() {
  local name="$1"
  local value="$2"
  if [ -z "$value" ]; then
    echo -e "${YELLOW}  AVISO: $name está vazio, pulando...${NC}"
    return
  fi
  echo -n "  Criando $name... "
  echo "$value" | gh secret set "$name" --repo "$GITHUB_REPO"
  echo -e "${GREEN}OK${NC}"
}

# ─── Pré-requisitos ───────────────────────────
echo -e "\n${GREEN}=== Instalando gh CLI ===${NC}"
if ! command -v gh &>/dev/null; then
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] \
    https://cli.github.com/packages stable main" \
    | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
  sudo apt update -qq && sudo apt install gh -y
  echo -e "${GREEN}gh CLI instalado!${NC}"
else
  echo -e "${GREEN}gh CLI já instalado: $(gh --version | head -1)${NC}"
fi

# ─── Autenticação ─────────────────────────────
echo -e "\n${GREEN}=== Autenticando no GitHub ===${NC}"
if ! gh auth status &>/dev/null; then
  gh auth login --web
else
  echo -e "${GREEN}Já autenticado: $(gh auth status 2>&1 | grep 'Logged in' || true)${NC}"
fi

# ─── Verificar arquivos .env ──────────────────
echo -e "\n${GREEN}=== Verificando arquivos .env ===${NC}"
check "$PROD_ENV_FILE"
check "$DEV_ENV_FILE"
echo -e "${GREEN}Arquivos encontrados!${NC}"

# ─── Ler variáveis ────────────────────────────
echo -e "\n${GREEN}=== Lendo variáveis dos ambientes ===${NC}"

PROD_APP_KEY=$(get_env "$PROD_ENV_FILE" "APP_KEY")
PROD_DB_ROOT_PASSWORD=$(get_env "/var/www/erp/.env" "DB_ROOT_PASSWORD" 2>/dev/null || get_env "$PROD_ENV_FILE" "DB_PASSWORD")
PROD_DB_PASSWORD=$(get_env "$PROD_ENV_FILE" "DB_PASSWORD")
PROD_APP_URL=$(get_env "$PROD_ENV_FILE" "APP_URL")
PROD_NEXT_PUBLIC_API_URL=$(get_env "$PROD_FRONTEND_ENV" "NEXT_PUBLIC_API_URL" 2>/dev/null || echo "${PROD_APP_URL}/api")

DEV_APP_KEY=$(get_env "$DEV_ENV_FILE" "APP_KEY")
DEV_DB_ROOT_PASSWORD=$(get_env "/var/www/erp-dev/.env" "DB_ROOT_PASSWORD" 2>/dev/null || get_env "$DEV_ENV_FILE" "DB_PASSWORD")
DEV_DB_PASSWORD=$(get_env "$DEV_ENV_FILE" "DB_PASSWORD")
DEV_APP_URL=$(get_env "$DEV_ENV_FILE" "APP_URL")
DEV_NEXT_PUBLIC_API_URL=$(get_env "$DEV_FRONTEND_ENV" "NEXT_PUBLIC_API_URL" 2>/dev/null || echo "${DEV_APP_URL}/api")

SSH_KEY_CONTENT=$(cat "$SSH_KEY_PATH")

echo -e "${GREEN}Variáveis lidas com sucesso!${NC}"

# ─── Preview antes de criar ───────────────────
echo -e "\n${YELLOW}=== Preview dos secrets a serem criados ===${NC}"
echo "  VPS_HOST               = $VPS_HOST"
echo "  VPS_USER               = $VPS_USER"
echo "  VPS_SSH_KEY            = [chave de $SSH_KEY_PATH]"
echo "  PROD_APP_KEY           = ${PROD_APP_KEY:0:20}..."
echo "  PROD_DB_ROOT_PASSWORD  = ${PROD_DB_ROOT_PASSWORD:0:4}****"
echo "  PROD_DB_PASSWORD       = ${PROD_DB_PASSWORD:0:4}****"
echo "  PROD_APP_URL           = $PROD_APP_URL"
echo "  PROD_NEXT_PUBLIC_API_URL = $PROD_NEXT_PUBLIC_API_URL"
echo "  DEV_APP_KEY            = ${DEV_APP_KEY:0:20}..."
echo "  DEV_DB_ROOT_PASSWORD   = ${DEV_DB_ROOT_PASSWORD:0:4}****"
echo "  DEV_DB_PASSWORD        = ${DEV_DB_PASSWORD:0:4}****"
echo "  DEV_APP_URL            = $DEV_APP_URL"
echo "  DEV_NEXT_PUBLIC_API_URL = $DEV_NEXT_PUBLIC_API_URL"

echo ""
read -p "Confirmar criação dos secrets no repo $GITHUB_REPO? [s/N] " confirm
[[ "$confirm" =~ ^[sS]$ ]] || { echo "Cancelado."; exit 0; }

# ─── Criar secrets ────────────────────────────
echo -e "\n${GREEN}=== Criando secrets no GitHub ===${NC}"

echo -e "\n[Compartilhados]"
set_secret "VPS_HOST"    "$VPS_HOST"
set_secret "VPS_USER"    "$VPS_USER"
echo -n "  Criando VPS_SSH_KEY... "
echo "$SSH_KEY_CONTENT" | gh secret set "VPS_SSH_KEY" --repo "$GITHUB_REPO"
echo -e "${GREEN}OK${NC}"

echo -e "\n[Produção]"
set_secret "PROD_APP_KEY"            "$PROD_APP_KEY"
set_secret "PROD_DB_ROOT_PASSWORD"   "$PROD_DB_ROOT_PASSWORD"
set_secret "PROD_DB_PASSWORD"        "$PROD_DB_PASSWORD"
set_secret "PROD_APP_URL"            "$PROD_APP_URL"
set_secret "PROD_NEXT_PUBLIC_API_URL" "$PROD_NEXT_PUBLIC_API_URL"

echo -e "\n[Dev]"
set_secret "DEV_APP_KEY"             "$DEV_APP_KEY"
set_secret "DEV_DB_ROOT_PASSWORD"    "$DEV_DB_ROOT_PASSWORD"
set_secret "DEV_DB_PASSWORD"         "$DEV_DB_PASSWORD"
set_secret "DEV_APP_URL"             "$DEV_APP_URL"
set_secret "DEV_NEXT_PUBLIC_API_URL" "$DEV_NEXT_PUBLIC_API_URL"

# ─── Verificar ────────────────────────────────
echo -e "\n${GREEN}=== Secrets criados com sucesso! ===${NC}"
echo -e "Listando secrets do repo:"
gh secret list --repo "$GITHUB_REPO"
