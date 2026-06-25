# Despliegue VPS Produccion (ITZALAN TECH)

## Checklist de despliegue

- [ ] VPS Ubuntu 22.04+ actualizado (`apt update && apt upgrade -y`)
- [ ] DNS configurado: `itzalan.com`, `www.itzalan.com`, `api.itzalan.com`
- [ ] Firewall activo (`ufw allow OpenSSH`, `ufw allow 80`, `ufw allow 443`)
- [ ] Docker + Compose instalados (si usara Docker)
- [ ] Node 20 + PM2 instalados (si usara PM2)
- [ ] Repo clonado en `/var/www/itzalan`
- [ ] Variables de entorno cargadas desde [deploy/env/.env.production.example](deploy/env/.env.production.example)
- [ ] Build de API y Web exitoso
- [ ] SSL emitido y renovacion automatica habilitada
- [ ] Backup diario de PostgreSQL y prueba de restore validada

## Variables requeridas

Base y URLs:
- `NODE_ENV=production`
- `APP_URL`
- `API_URL`

API:
- `PORT`
- `DB_TYPE`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `DB_SSL`, `DB_SYNCHRONIZE=false`, `DB_MIGRATIONS_RUN=true`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`
- `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`

IA:
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

Pagos:
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE`, `PAYPAL_WEBHOOK_ID`
- `PAYPAL_WEBHOOK_SECRET` (opcional para fallback local)

Web:
- `NEXT_PUBLIC_API_URL`

Use [deploy/env/.env.production.example](deploy/env/.env.production.example) como plantilla.

## Opcion A: Docker (recomendada para VPS limpio)

### 1. Preparar env

```bash
cd /var/www/itzalan
cp deploy/env/.env.production.example deploy/env/.env.production
nano deploy/env/.env.production
```

### 2. Build y arranque

```bash
cd /var/www/itzalan/deploy/docker
docker compose -f docker-compose.vps.yml --env-file ../env/.env.production up -d --build
```

### 3. Verificacion

```bash
docker compose -f docker-compose.vps.yml ps
curl -I http://localhost
curl -I http://localhost:3001
```

Archivos usados:
- [deploy/docker/docker-compose.vps.yml](deploy/docker/docker-compose.vps.yml)
- [deploy/docker/Dockerfile.api](deploy/docker/Dockerfile.api)
- [deploy/docker/Dockerfile.web](deploy/docker/Dockerfile.web)
- [deploy/nginx/itzalan.conf](deploy/nginx/itzalan.conf)

## Opcion B: PM2 (sin contenedores)

### 1. Build

```bash
cd /var/www/itzalan
npm ci
npm --workspace @itzalan/api run build
npm --workspace @itzalan/web run build
```

### 2. Arranque con PM2

```bash
pm2 start deploy/pm2/ecosystem.config.cjs
pm2 save
pm2 startup
```

Archivo usado:
- [deploy/pm2/ecosystem.config.cjs](deploy/pm2/ecosystem.config.cjs)

## Backups

Script incluido:
- [scripts/backup_postgres.sh](scripts/backup_postgres.sh)

### 1. Ejecucion manual

```bash
chmod +x scripts/backup_postgres.sh
DB_PASSWORD='TU_PASSWORD' DB_HOST='127.0.0.1' DB_NAME='itzalan_prod' ./scripts/backup_postgres.sh
```

### 2. Cron diario (03:30)

```bash
crontab -e
```

Agregar:

```cron
30 3 * * * DB_PASSWORD='TU_PASSWORD' DB_HOST='127.0.0.1' DB_NAME='itzalan_prod' /var/www/itzalan/scripts/backup_postgres.sh >> /var/log/itzalan/backup.log 2>&1
```

### 3. Restore de prueba

```bash
pg_restore -h 127.0.0.1 -p 5432 -U itzalan -d itzalan_restore /var/backups/itzalan/itzalan-YYYYMMDD-HHMMSS.dump
```

## SSL (Let's Encrypt)

Con Nginx + Certbot:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot certonly --webroot -w /var/www/certbot -d itzalan.com -d www.itzalan.com -d api.itzalan.com
```

Renovacion automatica:

```bash
sudo systemctl enable certbot.timer
sudo certbot renew --dry-run
```

## Comandos operativos utiles

Docker:

```bash
cd /var/www/itzalan/deploy/docker
docker compose -f docker-compose.vps.yml logs -f api
docker compose -f docker-compose.vps.yml logs -f web
docker compose -f docker-compose.vps.yml restart api web
```

PM2:

```bash
pm2 status
pm2 logs itzalan-api --lines 100
pm2 logs itzalan-web --lines 100
pm2 restart itzalan-api itzalan-web
```

## Checklist post-deploy

- [ ] `https://itzalan.com` responde 200
- [ ] `https://api.itzalan.com` responde 200/401 segun endpoint
- [ ] Login y registro funcionales
- [ ] Consulta IA responde en modo esperado
- [ ] Checkout PayPal responde en modo configurado
- [ ] Webhooks de suscripcion cambiando estados correctamente
- [ ] Backup diario ejecutado y dump generado
