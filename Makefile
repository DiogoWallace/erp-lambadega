.PHONY: test test-frontend test-backend artisan migrate seed fresh logs shell backup-now backup-list backup-restore

# Roda toda a suite de testes (backend + frontend)
test: test-backend test-frontend

test-backend:
	docker compose exec backend composer install --no-interaction --ignore-platform-reqs
	docker compose exec backend php artisan test

test-frontend:
	docker compose exec frontend npm test

# Passa comandos artisan direto: make artisan CMD="route:list"
artisan:
	docker compose exec backend php artisan $(CMD)

migrate:
	docker compose exec backend php artisan migrate

seed:
	docker compose exec backend php artisan db:seed --class=RoleSeeder

fresh:
	docker compose exec backend php artisan migrate:fresh --seed

logs:
	docker compose logs -f backend

shell:
	docker compose exec backend bash

# ── Backup do MySQL ────────────────────────────────────────────────────────
# COMPOSE_FILE define qual ambiente atingir (default: produção).
# Override: make backup-now COMPOSE_FILE=docker-compose.yml MYSQL_DATABASE=erp_local_db MYSQL_PASSWORD=localroot
COMPOSE_FILE ?= docker-compose.prod.yml

# Dispara um dump imediato (não espera a janela das 03:00 UTC).
backup-now:
	docker compose -f $(COMPOSE_FILE) exec -e ONESHOT=1 db-backup /bin/sh /usr/local/bin/backup-mysql.sh

# Lista os dumps disponíveis no volume.
backup-list:
	docker compose -f $(COMPOSE_FILE) exec db-backup ls -lh /backups

# Restaura um dump. Uso: make backup-restore FILE=erp_db-2026-05-23_030000.sql.gz
backup-restore:
	@test -n "$(FILE)" || (echo "FILE=<dump.sql.gz> é obrigatório (veja make backup-list)"; exit 1)
	docker compose -f $(COMPOSE_FILE) exec db-backup sh -c \
		'gunzip -c /backups/$(FILE) | mysql -h $$MYSQL_HOST -u $$MYSQL_USER -p$$MYSQL_PASSWORD'
