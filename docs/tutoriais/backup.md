# Backup do MySQL (produção)

Backup automático diário do banco de produção, com retenção de 7 dias.

## Como funciona

O serviço `db-backup` (sidecar em `docker-compose.prod.yml`) usa a mesma imagem `mysql:8.0` e roda um loop simples em shell:

1. Calcula o tempo até a próxima execução (padrão: **03:00 UTC** todo dia).
2. Faz `mysqldump --single-transaction --quick --routines --triggers --no-tablespaces` do banco e comprime com `gzip`.
3. Salva em `/backups/erp_db-YYYY-MM-DD_HHMMSS.sql.gz` (volume Docker `db_backups`).
4. Remove dumps com mais de `BACKUP_RETENTION_DAYS` dias (padrão **7**).

O volume `db_backups` é nomeado — sobrevive a `docker compose down` e recreates do container.

## Variáveis

| Variável | Default | Observação |
|---|---|---|
| `MYSQL_HOST` | `db` | Nome do serviço do banco |
| `MYSQL_USER` | `root` | Precisa de `SELECT`, `LOCK TABLES`, `TRIGGER` em todas as tabelas |
| `MYSQL_PASSWORD` | (de `PROD_DB_ROOT_PASSWORD`) | Vem do GitHub Secret |
| `MYSQL_DATABASE` | `erp_db` | Banco a fazer backup |
| `BACKUP_RETENTION_DAYS` | `7` | Retenção em dias |
| `BACKUP_HOUR_UTC` | `3` | Hora UTC da rodada (`3` = 00:00 BRT) |

## Comandos no dia a dia

```bash
# Lista os dumps existentes
make backup-list

# Dispara um dump imediato (não espera a janela das 03:00 UTC)
make backup-now

# Acompanha o loop em tempo real
docker compose -f docker-compose.prod.yml logs -f db-backup
```

## Restauração

> ⚠️ **Atenção:** restaurar **sobrescreve** o banco atual. Faça backup antes (`make backup-now`) caso precise do estado em vigor.

```bash
# 1. Liste os dumps disponíveis
make backup-list

# 2. Coloque a aplicação em manutenção (ou pare backend/frontend)
docker compose -f docker-compose.prod.yml stop backend frontend

# 3. Restaure o dump escolhido
make backup-restore FILE=erp_db-2026-05-23_030000.sql.gz

# 4. Suba os serviços de volta
docker compose -f docker-compose.prod.yml start backend frontend
```

## Copiar um dump para fora do servidor

```bash
# Identifique o container
container=$(docker compose -f docker-compose.prod.yml ps -q db-backup)

# Copia o dump específico
docker cp "$container:/backups/erp_db-2026-05-23_030000.sql.gz" ./
```

## Considerações operacionais

- **Espaço em disco:** com retenção de 7 dias e um dump diário, o volume cresce até estabilizar em ~7× o tamanho de um dump comprimido. Acompanhe `df -h` na VPS Hostinger.
- **Verificação periódica:** uma vez por mês, copie o último dump para outra máquina e teste o restore num MySQL local para garantir que o backup é íntegro.
- **Off-site:** este setup é **local ao servidor**. Se a VPS for perdida (drive corrompido, conta encerrada), os backups vão junto. Para resiliência maior, configure `rsync`/`rclone` para enviar `/var/lib/docker/volumes/erp-prod_db_backups/_data/` para S3/R2 (fora do escopo desta primeira iteração).
- **Falhas:** se o `mysqldump` falhar, o container loga o erro e tenta de novo em 1h. Não há alerta automático ainda — verificar `docker compose logs db-backup` periodicamente ou plugar num sistema de monitoramento.
