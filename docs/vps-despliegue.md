# Despliegue VPS Produccion - ITZALAN TECH / LEXIA Legal IA

Documento operativo oficial para produccion en VPS.

## Modo recomendado para primera version comercial

Modo oficial recomendado de produccion:
- PM2 + Nginx + PostgreSQL

Motivo:
- Menor complejidad operativa inicial
- Menos puntos de fallo en primera salida comercial
- Facil soporte y troubleshooting para equipo pequeno

Docker se mantiene como alternativa avanzada/opcional.

## 1) Guia operativa oficial (PM2 + Nginx + PostgreSQL)

### 1.1 Requisitos del servidor

- Ubuntu 22.04 LTS o superior
- 2 vCPU minimo (4 recomendado)
- 4 GB RAM minimo (8 recomendado)
- 40 GB SSD minimo
- DNS apuntando al VPS:
  - `itzalan.com`
  - `www.itzalan.com`
  - `api.itzalan.com`
- Puertos abiertos: `22`, `80`, `443`

Hardening basico inicial:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw curl git ca-certificates gnupg
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 1.2 Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential
node -v
npm -v
```

### 1.3 Instalar PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "CREATE USER itzalan WITH PASSWORD 'REPLACE_DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE itzalan_prod OWNER itzalan;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE itzalan_prod TO itzalan;"
```

### 1.4 Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable --now nginx
```

### 1.5 Instalar PM2

```bash
sudo npm install -g pm2
pm2 -v
```

### 1.6 Clonar proyecto y configurar entorno

```bash
sudo mkdir -p /opt/itzalan
sudo chown -R $USER:$USER /opt/itzalan
git clone <REPO_URL> /opt/itzalan
cd /opt/itzalan
cp .env.production.example .env.production
nano .env.production
```

Variables minimas requeridas en `.env.production`:

- `NODE_ENV=production`
- `DATABASE_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_SECRET`
- `PAYPAL_MODE=live`
- `PAYPAL_WEBHOOK_ID`
- `APP_URL`
- `API_URL`
- `CORS_ORIGIN`

Checklist obligatorio de variables de produccion (release gate):

- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `OPENAI_API_KEY` **o** `ANTHROPIC_API_KEY`
- [ ] Keys de pagos configuradas:
  - [ ] PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE`, `PAYPAL_WEBHOOK_ID`
  - [ ] Stripe (si aplica): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`

### 1.7 Instalar dependencias y build

```bash
cd /opt/itzalan
npm install
npm --workspace @itzalan/api run build
npm --workspace @itzalan/web run build
```

### 1.8 Ejecutar migraciones

```bash
cd /opt/itzalan
npm --workspace @itzalan/api run db:migration:run
```

### 1.9 Iniciar con PM2

```bash
cd /opt/itzalan
sudo mkdir -p /var/log/itzalan
sudo chown -R $USER:$USER /var/log/itzalan
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 1.10 Configurar Nginx reverse proxy

Usar plantilla:
- `deploy/nginx/itzalan.vps.conf`

Aplicar configuracion:

```bash
sudo cp /opt/itzalan/deploy/nginx/itzalan.vps.conf /etc/nginx/sites-available/itzalan.conf
sudo ln -sf /etc/nginx/sites-available/itzalan.conf /etc/nginx/sites-enabled/itzalan.conf
sudo nginx -t
sudo systemctl reload nginx
```

### 1.11 Activar SSL con Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d itzalan.com -d www.itzalan.com -d api.itzalan.com
sudo systemctl enable certbot.timer
sudo certbot renew --dry-run
```

## 2) Configuracion PM2

Archivo principal:
- `ecosystem.config.js`

Incluye:
- Proceso API (`itzalan-api`)
- Proceso Web (`itzalan-web`)
- Logs:
  - `/var/log/itzalan/api.out.log`
  - `/var/log/itzalan/api.err.log`
  - `/var/log/itzalan/web.out.log`
  - `/var/log/itzalan/web.err.log`
- Reinicio automatico:
  - `autorestart: true`
  - `max_restarts: 10`
  - `restart_delay: 2000`

Comandos utiles:

```bash
pm2 status
pm2 logs itzalan-api --lines 100
pm2 logs itzalan-web --lines 100
pm2 restart itzalan-api itzalan-web
```

## 3) Docker (alternativa avanzada/opcional)

Docker NO es el modo oficial para la primera version comercial.
Se mantiene como alternativa para equipos con operacion basada en contenedores.

Archivos:
- `deploy/docker-compose.yml`
- `deploy/docker/Dockerfile.api`
- `deploy/docker/Dockerfile.web`
- `deploy/nginx/itzalan.conf` (opcional en modo Docker)

Arranque:

```bash
docker compose -f deploy/docker-compose.yml up -d --build
```

Con Nginx opcional:

```bash
docker compose -f deploy/docker-compose.yml --profile nginx up -d --build
```

## 4) Backups PostgreSQL

Script:
- `scripts/backup_postgres.sh`

Caracteristicas:
- Backup PostgreSQL (`pg_dump -F c`)
- Carpeta `backups/`
- Nombre con fecha
- Retencion por dias (`RETENTION_DAYS`)
- Comando de restauracion en salida

Ejecucion manual:

```bash
chmod +x scripts/backup_postgres.sh
DB_HOST=127.0.0.1 DB_PORT=5432 DB_NAME=itzalan_prod DB_USER=itzalan DB_PASSWORD='REPLACE_DB_PASSWORD' ./scripts/backup_postgres.sh
```

Restore ejemplo:

```bash
PGPASSWORD='REPLACE_DB_PASSWORD' pg_restore -h 127.0.0.1 -p 5432 -U itzalan -d itzalan_prod backups/itzalan-YYYYMMDD-HHMMSS.dump
```

Cron diario (03:00):

```cron
0 3 * * * DB_HOST=127.0.0.1 DB_PORT=5432 DB_NAME=itzalan_prod DB_USER=itzalan DB_PASSWORD='REPLACE_DB_PASSWORD' /opt/itzalan/scripts/backup_postgres.sh >> /var/log/itzalan/backup.log 2>&1
```

## 5) Checklist final

- [ ] build API OK
- [ ] build Web OK
- [ ] migraciones DB OK
- [ ] API activa
- [ ] Web activa
- [ ] SSL activo
- [ ] OpenAI activo
- [ ] PayPal live activo
- [ ] webhook PayPal funcionando

## 6) Comandos finales para produccion

Ejecutar en el VPS (ruta `/opt/itzalan`):

```bash
cd /opt/itzalan

# 1) Dependencias
npm ci

# 2) Build completo del monorepo
npm run build

# 3) Migraciones de base de datos
npm run db:migrate

# 4) Arranque con PM2
pm2 start ecosystem.config.js
pm2 save

# 5) Recargar Nginx
sudo nginx -t && sudo systemctl reload nginx

# 6) SSL (si aun no existe certificado)
sudo certbot --nginx -d itzalan.com -d www.itzalan.com -d api.itzalan.com

# 7) Verificaciones rapidas
pm2 status
curl -I https://api.itzalan.com
curl -I https://itzalan.com
```

Validaciones recomendadas:

```bash
# Build
npm --workspace @itzalan/api run build
npm --workspace @itzalan/web run build

# Migraciones
npm --workspace @itzalan/api run db:migration:run

# API / Web
curl -I https://api.itzalan.com
curl -I https://itzalan.com

# PM2
pm2 status

# SSL
sudo certbot renew --dry-run

# Webhook PayPal (endpoint)
curl -X POST https://api.itzalan.com/api/subscriptions/webhook/paypal -H 'Content-Type: application/json' -d '{}'
```
