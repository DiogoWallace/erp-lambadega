#!/bin/bash
set -e

DOMAINS=(-d inovabi.com -d api.inovabi.com -d dev.inovabi.com -d api-dev.inovabi.com)
EMAIL="admin@inovabi.com"
CERT_PATH="./certbot/conf/live/inovabi.com/fullchain.pem"

echo "==> Verificando se certificado já existe..."
if [ -f "$CERT_PATH" ]; then
  echo "Certificado já existe. Nenhuma ação necessária."
  exit 0
fi

echo "==> Criando diretórios do Certbot..."
mkdir -p ./certbot/conf ./certbot/www

echo "==> Ativando config HTTP-only para validação ACME..."
cp nginx/conf.d/default.conf nginx/conf.d/default.conf.ssl_bak
cp nginx/conf.d/bootstrap.conf nginx/conf.d/default.conf

echo "==> Iniciando nginx em modo HTTP-only..."
docker compose -f docker-compose.prod.yml up -d webserver

echo "==> Aguardando nginx subir..."
sleep 3

echo "==> Gerando certificado Let's Encrypt..."
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  "${DOMAINS[@]}" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email

echo "==> Restaurando config SSL completa..."
cp nginx/conf.d/default.conf.ssl_bak nginx/conf.d/default.conf
rm nginx/conf.d/default.conf.ssl_bak

echo "==> Recarregando nginx com SSL..."
docker compose -f docker-compose.prod.yml exec -T webserver nginx -s reload

echo "==> Subindo stack completo..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "SSL configurado com sucesso!"
echo "Renovação automática: gerenciada pelo serviço 'certbot' no docker-compose."
