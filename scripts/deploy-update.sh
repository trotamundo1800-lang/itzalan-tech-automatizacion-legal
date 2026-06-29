#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/itzalan"
ENV_FILE="${APP_DIR}/.env.production"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

echo "== 1) Entering ${APP_DIR} =="
cd "${APP_DIR}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "ERROR: Missing ${ENV_FILE}"
  exit 1
fi

echo "== Loading environment from ${ENV_FILE} =="
set -a
source "${ENV_FILE}"
set +a

echo "== 2) Creating quick backup =="
mkdir -p "${BACKUP_DIR}"
PREV_COMMIT="$(git rev-parse HEAD)"
echo "${PREV_COMMIT}" > "${BACKUP_DIR}/last-known-good-${TIMESTAMP}.txt"
echo "Saved last-known-good commit: ${PREV_COMMIT}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is required in ${ENV_FILE}"
  exit 1
fi
pg_dump "${DATABASE_URL}" -Fc -f "${BACKUP_DIR}/db-${TIMESTAMP}.dump"
echo "Saved DB dump: ${BACKUP_DIR}/db-${TIMESTAMP}.dump"

echo "== 3) Pulling latest main =="
git fetch origin
git checkout main
git pull origin main

echo "== 4) Installing dependencies =="
npm install

echo "== 5) Building =="
npm run build

echo "== 6) Running migrations =="
npm run db:migrate

echo "== 7) Reloading PM2 =="
pm2 reload ecosystem.config.prod.js --update-env
pm2 save

echo "== 8) Verifying PM2 status/logs =="
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

echo "== 9) Verifying web and API =="
curl -fsSI https://itzalan.com >/dev/null
curl -fsSI https://api.itzalan.com >/dev/null
echo "Web/API checks passed."

echo "Deploy update finished successfully."
