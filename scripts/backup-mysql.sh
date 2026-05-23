#!/bin/sh
# Backup diário do MySQL com retenção configurável.
#
# Variáveis esperadas:
#   MYSQL_HOST          host do mysql (padrão: db)
#   MYSQL_USER          usuário com SELECT em todas as tabelas (padrão: root)
#   MYSQL_PASSWORD      senha
#   MYSQL_DATABASE      banco a fazer backup
#   BACKUP_DIR          diretório de saída (padrão: /backups)
#   BACKUP_RETENTION_DAYS  retenção em dias (padrão: 7)
#   BACKUP_HOUR_UTC     hora UTC para rodar (padrão: 3 → 03:00 UTC)
#
# Quando ONESHOT=1, faz um dump único e sai (útil para `make backup-now`).

set -eu

: "${MYSQL_HOST:=db}"
: "${MYSQL_USER:=root}"
: "${MYSQL_DATABASE:?MYSQL_DATABASE não definido}"
: "${MYSQL_PASSWORD:?MYSQL_PASSWORD não definido}"
: "${BACKUP_DIR:=/backups}"
: "${BACKUP_RETENTION_DAYS:=7}"
: "${BACKUP_HOUR_UTC:=3}"

mkdir -p "$BACKUP_DIR"

log() {
    printf '[backup] %s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"
}

do_backup() {
    timestamp=$(date -u +%Y-%m-%d_%H%M%S)
    file="$BACKUP_DIR/${MYSQL_DATABASE}-${timestamp}.sql.gz"
    log "iniciando dump → $file"

    # --single-transaction: consistente sem locking (InnoDB)
    # --quick: streaming (não buffer da tabela inteira em memória)
    # --routines / --triggers: inclui procedures e triggers
    # --no-tablespaces: requerido sem o privilégio PROCESS
    mysqldump \
        -h "$MYSQL_HOST" \
        -u "$MYSQL_USER" \
        -p"$MYSQL_PASSWORD" \
        --single-transaction \
        --quick \
        --routines \
        --triggers \
        --no-tablespaces \
        --databases "$MYSQL_DATABASE" | gzip -c > "$file"

    size=$(du -h "$file" | awk '{print $1}')
    log "dump concluído ($size)"

    log "limpando dumps com mais de $BACKUP_RETENTION_DAYS dias"
    find "$BACKUP_DIR" -name "*.sql.gz" -type f -mtime +"$BACKUP_RETENTION_DAYS" -print -delete | sed 's/^/[backup] removido: /'
}

if [ "${ONESHOT:-0}" = "1" ]; then
    do_backup
    exit 0
fi

log "iniciando loop diário (rodada às ${BACKUP_HOUR_UTC}:00 UTC, retenção ${BACKUP_RETENTION_DAYS}d)"

while :; do
    # Calcula segundos até a próxima rodada às BACKUP_HOUR_UTC:00 UTC.
    now=$(date -u +%s)
    today_run=$(date -u -d "today ${BACKUP_HOUR_UTC}:00:00" +%s 2>/dev/null || date -u +%s)
    if [ "$today_run" -le "$now" ]; then
        next_run=$(date -u -d "tomorrow ${BACKUP_HOUR_UTC}:00:00" +%s)
    else
        next_run=$today_run
    fi
    sleep_s=$((next_run - now))
    log "próxima execução em ${sleep_s}s ($(date -u -d "@$next_run" +%Y-%m-%dT%H:%M:%SZ))"
    sleep "$sleep_s"

    if ! do_backup; then
        log "ERRO: dump falhou — tentando de novo em 1h"
        sleep 3600
    fi
done
