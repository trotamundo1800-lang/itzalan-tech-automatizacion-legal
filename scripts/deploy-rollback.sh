#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/itzalan"
ENV_FILE="${APP_DIR}/.env.production"
BACKUP_DIR="${APP_DIR}/backups"

echo "== Entering ${APP_DIR} =="
cd "${APP_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: Missing ${ENV_FILE}"
  exit 1
fi

echo "== Loading environment from ${ENV_FILE} =="
set -a
source "${ENV_FILE}"
set +a

echo "== Reading rollback commit =="
if [[ $# -gt 0 ]]; then
  ROLLBACK_COMMIT="$1"
  echo "Using commit from argument: ${ROLLBACK_COMMIT}"
else
  LAST_FILE="$(ls -t "${BACKUP_DIR}"/last-known-good-*.txt 2>/dev/null | head -n 1 || true)"
  if [[ -z "${LAST_FILE}" ]]; then
    echo "ERROR: No last-known-good file found in ${BACKUP_DIR}"
    exit 1
  fi
  ROLLBACK_COMMIT="$(cat "${LAST_FILE}")"
  echo "Using latest last-known-good file: ${LAST_FILE}"
  echo "Rollback commit: ${ROLLBACK_COMMIT}"
fi

echo "== Rolling back code to ${ROLLBACK_COMMIT} =="
git fetch origin
git checkout main
git reset --hard "${ROLLBACK_COMMIT}"

echo "== Reinstalling dependencies and rebuilding =="
npm install
npm run build

echo "== Optional DB rollback =="
if [[ -n "${ROLLBACK_DB_DUMP:-}" ]]; then
  if [[ ! -f "${ROLLBACK_DB_DUMP}" ]]; then
    echo "ERROR: ROLLBACK_DB_DUMP not found: ${ROLLBACK_DB_DUMP}"
    exit 1
  fi
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "ERROR: DATABASE_URL is required in ${ENV_FILE}"
    exit 1
  fi
  pg_restore --clean --if-exists -d "${DATABASE_URL}" "${ROLLBACK_DB_DUMP}"
  echo "Database restored from ${ROLLBACK_DB_DUMP}"
else
  echo "Skipping DB restore (set ROLLBACK_DB_DUMP=/path/to/dump to enable)."
fi

echo "== Reloading PM2 =="
pm2 reload ecosystem.config.prod.js --update-env
pm2 save

echo "== Verifying PM2 status/logs =="
pm2 status
pm2 jlist | node -e '
const fs = require("fs");
const list = JSON.parse(fs.readFileSync(0, "utf8"));
const required = ["itzalan-api", "itzalan-web"];
const bad = required.filter((name) => {
  const app = list.find((p) => p.name === name);
  return !app || app.pm2_env.status !== "online";
});
if (bad.length) {
  console.error(`ERROR: PM2 apps not online: ${bad.join(", ")}`);
  process.exit(1);
}
console.log("PM2 apps online: itzalan-api, itzalan-web");
'
pm2 logs itzalan-api --lines 50 --nostream || true
pm2 logs itzalan-web --lines 50 --nostream || true

echo "== Verifying web and API =="
curl -fsSI https://itzalan.com >/dev/null
curl -fsSI https://api.itzalan.com >/dev/null
echo "Web/API checks passed."

echo "Rollback finished successfully."
