#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR=${BACKUP_DIR:-"${SCRIPT_DIR}/../backups"}
RETENTION_DAYS=${RETENTION_DAYS:-14}
DB_HOST=${DB_HOST:-127.0.0.1}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-itzalan_prod}
DB_USER=${DB_USER:-itzalan}
DB_PASSWORD=${DB_PASSWORD:-}

if [[ -z "${DB_PASSWORD}" ]]; then
  echo "DB_PASSWORD is required"
  exit 1
fi

mkdir -p "${BACKUP_DIR}"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/itzalan-${TIMESTAMP}.dump"

export PGPASSWORD="${DB_PASSWORD}"
pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -F c \
  -f "${BACKUP_FILE}"

find "${BACKUP_DIR}" -type f -name "itzalan-*.dump" -mtime +"${RETENTION_DAYS}" -delete

echo "Backup created: ${BACKUP_FILE}"
echo "Restore command: PGPASSWORD='${DB_PASSWORD}' pg_restore -h '${DB_HOST}' -p '${DB_PORT}' -U '${DB_USER}' -d '${DB_NAME}' '${BACKUP_FILE}'"
