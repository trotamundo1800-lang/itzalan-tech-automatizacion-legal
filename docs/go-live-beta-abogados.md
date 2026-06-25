# Go-Live Final: VPS -> Dominio -> SSL -> IA real -> Pagos -> Beta con abogados

Este documento define la secuencia final de salida a produccion para ITZALAN TECH.

## 1) Build final y verificacion tecnica

Ejecutar desde raiz del proyecto:

```bash
npm ci
npm run build
npm run db:migrate
```

Criterio de aprobacion:
- `npm run build` sin errores (web, api, mobile).
- `npm run db:migrate` exitoso contra PostgreSQL de produccion.

## 2) Provision VPS (Node + PostgreSQL + PM2 + Nginx)

Servidor recomendado:
- Ubuntu 22.04+
- 4 vCPU, 8 GB RAM, 80 GB SSD (recomendado para beta estable)

Instalacion base:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw curl git ca-certificates gnupg nginx postgresql postgresql-contrib
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential
sudo npm install -g pm2
```

## 3) Dominio y DNS

Configurar registros DNS:
- `A itzalan.com -> <IP_VPS>`
- `A www.itzalan.com -> <IP_VPS>`
- `A api.itzalan.com -> <IP_VPS>`

Validar propagacion:

```bash
dig +short itzalan.com
dig +short api.itzalan.com
```

## 4) Variables de entorno de produccion (release gate)

Archivo en VPS: `/opt/itzalan/.env.production`

Obligatorias:
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_API_URL=https://api.itzalan.com`
- `OPENAI_API_KEY` o `ANTHROPIC_API_KEY`
- `PAYPAL_CLIENT_ID`, `PAYPAL_SECRET`, `PAYPAL_MODE=live`, `PAYPAL_WEBHOOK_ID`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (si Stripe activo)

Recomendadas:
- `CORS_ORIGIN=https://itzalan.com`
- `CORS_ORIGINS=https://itzalan.com,https://www.itzalan.com`
- `DB_SYNCHRONIZE=false`
- `DB_MIGRATIONS_RUN=true`

## 5) SSL con Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d itzalan.com -d www.itzalan.com -d api.itzalan.com
sudo systemctl enable certbot.timer
sudo certbot renew --dry-run
```

Criterio de aprobacion:
- Certificados emitidos.
- Renovacion automatica OK.

## 6) Levantar API + frontend con PM2

```bash
cd /opt/itzalan
npm ci
npm run build
npm run db:migrate
pm2 start ecosystem.config.js
pm2 save
pm2 startup
pm2 status
```

Validacion rapida:

```bash
curl -I https://api.itzalan.com
curl -I https://itzalan.com
```

## 7) Activar IA real (sin modo fallback)

Checklist:
- API key valida (`OPENAI_API_KEY` o `ANTHROPIC_API_KEY`).
- Limites/cuotas en proveedor revisados.
- Prueba funcional en `/ia-juridica` con respuesta real.

Pruebas recomendadas:
- Consulta general.
- Analisis de documento.
- Historial de IA persistido (`GET /api/ia-juridica/historial`).

## 8) Activar pagos reales

PayPal:
- `PAYPAL_MODE=live`.
- Webhook live configurado apuntando a:
  - `https://api.itzalan.com/api/subscriptions/webhook/paypal`
  - `https://api.itzalan.com/api/subscriptions/webhooks/paypal`

Stripe (si aplica):
- Endpoint webhook:
  - `https://api.itzalan.com/api/subscriptions/webhooks/stripe`

Checklist de pruebas:
- Alta de suscripcion (plan basico/professional).
- Cancelacion.
- Reflejo en `GET /api/subscriptions/me`.

## 9) Beta con abogados (controlada)

Lanzamiento por cohortes:
- Cohorte 1: 5 abogados (3-5 dias)
- Cohorte 2: 20 abogados (7 dias)
- Cohorte 3: 50 abogados (segun estabilidad)

KPIs minimos para avanzar de cohorte:
- Uptime >= 99.5%
- Error rate API < 1%
- Tiempo medio respuesta API < 800 ms (p95)
- Conversion prueba -> suscripcion >= 15%
- NPS beta >= 40

Canales de soporte beta:
- Grupo de soporte (WhatsApp/Slack)
- Formulario de feedback en `/feedback`
- SLA interno de respuesta: < 24h

## 10) Comando unico de release (operacion manual)

```bash
cd /opt/itzalan && npm ci && npm run build && npm run db:migrate && pm2 restart itzalan-api itzalan-web && pm2 status
```

## 11) Go / No-Go final

Go (apto para beta):
- Build final OK
- Migraciones PostgreSQL OK
- Dominio + SSL OK
- IA real OK
- Pagos live OK
- Smoke test funcional OK (login, dashboard, documentos, IA, historial, suscripciones)

No-Go (bloqueante):
- Fallo en migraciones
- 5xx recurrentes
- SSL invalido/expirado
- IA sin respuesta real
- Webhooks de pago sin confirmacion
