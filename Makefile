.PHONY: test test-frontend test-backend artisan migrate seed fresh logs shell

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
