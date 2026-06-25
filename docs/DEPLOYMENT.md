# 🚀 GUÍA DE DESPLIEGUE - ITZALAN TECH

## Tabla de Contenidos
1. [Prerrequisitos](#prerrequisitos)
2. [Desarrollo Local](#desarrollo-local)
3. [Staging](#staging)
4. [Producción](#producción)
5. [Monitoreo](#monitoreo)
6. [Troubleshooting](#troubleshooting)

---

## Prerrequisitos

### Software Requerido
- Node.js 18+
- PostgreSQL 15+
- Docker 20.10+
- Docker Compose 2.0+
- Git
- Helm 3+ (para Kubernetes)

### Cuentas/Servicios
- GitHub (para CI/CD)
- AWS (S3, RDS, ECR, CloudWatch)
- Stripe (sandbox y production)
- PayPal (sandbox y production)
- OpenAI (API key)
- SendGrid o similar (email)

---

## Desarrollo Local

### 1. Setup Inicial
```bash
# Clonar repositorio
git clone https://github.com/yourorgan/ITZALAN-TECH.git
cd "ITZALAN TECH – AUTOMATIZACIÓN LEGAL"

# Instalar dependencias
npm install

# Crear .env con valores de desarrollo
cp .env.example .env

# Editar .env con valores locales
nano .env
```

### 2. Levantar Stack Completo (con Docker Compose)
```bash
# Crear network (si no existe)
docker network create itzalan-network || true

# Levantar PostgreSQL y servicios auxiliares
docker compose up -d

# Verificar que están running
docker compose ps
```

### 3. Iniciar Aplicaciones
```bash
# Terminal 1: API (puerto 3001)
npm run dev:api

# Terminal 2: Web (puerto 3000)
npm run dev

# Terminal 3: Mobile (puerto 19000)
npm run dev:mobile

# Terminal 4 (opcional): Monitoreo
npm run test:e2e --watch
```

### 4. Acceso a Aplicaciones
- **Web**: http://localhost:3000
- **API**: http://localhost:3001
- **Mobile**: Expo Go en teléfono
- **PostgreSQL**: localhost:5432 (user: itzalan, pass: changeme)

### 5. Ejecutar Tests
```bash
# Tests unitarios
npm run test --workspaces

# Tests E2E
npm run test:e2e

# Coverage
npm run test -- --coverage --workspaces
```

---

## Staging

### 1. Preparación
```bash
# Crear rama staging (si no existe)
git checkout -b staging
git push -u origin staging

# GitHub Actions tomará control automáticamente
```

### 2. Variables de Entorno (GitHub Secrets)
En tu repositorio GitHub, agregar estos secrets:
```
STAGING_DATABASE_URL=postgresql://user:pass@db-staging:5432/itzalan_staging
STAGING_JWT_SECRET=[generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
STAGING_STRIPE_KEY=sk_test_xxx
STAGING_OPENAI_KEY=sk-xxx
# ... más según .env.example
```

### 3. Despliegue Manual
```bash
# Push a staging branch activa el pipeline CI/CD
git add .
git commit -m "Deploy to staging"
git push origin staging

# Ver progreso en GitHub Actions
# https://github.com/yourorgan/ITZALAN-TECH/actions
```

### 4. Verificar Staging
```bash
# Acceder a staging
curl https://staging.itzalan.com/health

# Ver logs
kubectl logs -n staging deployment/itzalan-api

# Port-forward para debugging
kubectl port-forward -n staging svc/itzalan-api 3001:3001
```

---

## Producción

### ⚠️ CHECKLIST PRE-DEPLOYMENT

- [ ] Todos los tests pasando (100% E2E)
- [ ] Security scan sin vulnerabilidades críticas
- [ ] Performance test OK (Lighthouse 90+)
- [ ] Load testing completado
- [ ] Backup automático configurado
- [ ] Monitoring y alertas activas
- [ ] Runbook de incident response listo
- [ ] Aprobación de stakeholders

### 1. Crear Release

```bash
# Seguir semver: major.minor.patch
git tag -a v1.0.0 -m "Production Release v1.0.0"
git push origin v1.0.0

# GitHub Actions creará automáticamente Docker images
# con tag: itzalan/api:v1.0.0, itzalan/web:v1.0.0
```

### 2. Configurar Secrets en Producción

En GitHub Secrets agregar:
```
PROD_DATABASE_URL=postgresql://user:STRONG_PASSWORD@prod-db:5432/itzalan_prod
PROD_JWT_SECRET=[32+ caracteres random]
PROD_JWT_REFRESH_SECRET=[32+ caracteres random]
PROD_STRIPE_KEY=sk_live_xxx
PROD_PAYPAL_CLIENT_ID=xxx
PROD_OPENAI_KEY=sk-xxx
PROD_DOCKER_REGISTRY=ghcr.io
# ... más según .env.production
```

### 3. Despliegue (Helm + Kubernetes)

```bash
# Setup inicial (una sola vez)
kubectl create namespace itzalan-prod
kubectl apply -f helm/charts/postgresql/values-prod.yaml

# Desplegar
helm upgrade --install itzalan ./helm/charts/itzalan \
  -f helm/values-prod.yaml \
  --namespace itzalan-prod \
  --create-namespace \
  --wait

# Verificar despliegue
kubectl get all -n itzalan-prod
kubectl logs -n itzalan-prod deployment/itzalan-api
```

### 4. DNS y SSL

```bash
# Actualizar DNS records (en tu registrador)
A record: api.itzalan.com -> Load Balancer IP
A record: itzalan.com -> Load Balancer IP
A record: www.itzalan.com -> Load Balancer IP

# SSL automático (Let's Encrypt via cert-manager)
kubectl apply -f helm/charts/cert-manager/

# Validar certificado
kubectl get certificate -n itzalan-prod
```

### 5. Verificar Producción

```bash
# Health check
curl https://api.itzalan.com/health
curl https://itzalan.com/

# Ver logs en real-time
kubectl logs -n itzalan-prod deployment/itzalan-api -f

# Port-forward para debugging
kubectl port-forward -n itzalan-prod svc/itzalan-api 3001:3001
```

---

## Database Migrations

### Crear Migración Nueva
```bash
# Usando TypeORM
npm --workspace @itzalan/api run migration:create

# Editar archivo generado
nano apps/api/src/migrations/[timestamp]-migration.ts
```

### Ejecutar Migraciones
```bash
# Desarrollo
npm --workspace @itzalan/api run migration:run

# Producción (con respaldo automático)
kubectl exec -n itzalan-prod deployment/itzalan-api \
  -- npm run migration:run
```

### Rollback Migraciones
```bash
npm --workspace @itzalan/api run migration:revert
```

---

## Backup y Restore

### Configurar Backup Automático

```bash
# Crear CronJob en Kubernetes
kubectl apply -f helm/charts/backups/postgres-backup.yaml

# Configurar AWS S3 para almacenar backups
aws s3api create-bucket --bucket itzalan-backups
aws s3api put-bucket-versioning --bucket itzalan-backups --versioning-configuration Status=Enabled
```

### Realizar Backup Manual

```bash
# Backup de DB
kubectl exec -n itzalan-prod postgres-0 -- \
  pg_dump itzalan_prod -U itzalan | gzip > backup-$(date +%Y%m%d).sql.gz

# Upload a S3
aws s3 cp backup-$(date +%Y%m%d).sql.gz s3://itzalan-backups/
```

### Restore desde Backup

```bash
# Download backup
aws s3 cp s3://itzalan-backups/backup-20240624.sql.gz .
gunzip backup-20240624.sql.gz

# Restore a la BD
kubectl exec -i -n itzalan-prod postgres-0 -- \
  psql -U itzalan itzalan_prod < backup-20240624.sql
```

---

## Monitoreo

### 1. Logs Centralizados

```bash
# CloudWatch (si usas AWS)
kubectl logs -n itzalan-prod deployment/itzalan-api --tail=100 -f

# ELK Stack (alternativa on-premise)
curl http://elasticsearch:9200/_search?q=error
```

### 2. Métricas y Alertas

```bash
# Prometheus (ya incluido en helm chart)
kubectl port-forward -n itzalan-prod svc/prometheus 9090:9090

# Visualizar en Grafana
kubectl port-forward -n itzalan-prod svc/grafana 3000:3000
# Usuario: admin
# Password: [ver en values-prod.yaml]

# Configurar alertas
kubectl apply -f helm/charts/monitoring/prometheus-rules.yaml
```

### 3. Application Performance Monitoring

```bash
# New Relic (comercial)
npm install @newrelic/node-agent

# DataDog (comercial)
npm install dd-trace

# Sentry (open-source)
npm install @sentry/node
```

---

## Troubleshooting

### API no está respondiendo
```bash
# 1. Ver logs
kubectl logs -n itzalan-prod deployment/itzalan-api -f

# 2. Ver eventos del pod
kubectl describe pod -n itzalan-prod <pod-name>

# 3. Validar salud del pod
kubectl get pods -n itzalan-prod

# 4. Forzar reinicio
kubectl rollout restart deployment/itzalan-api -n itzalan-prod
```

### Database Connection Error
```bash
# 1. Verificar credenciales en .env
echo $PROD_DATABASE_URL

# 2. Probar conexión directa
psql postgresql://user:pass@host:5432/db

# 3. Ver logs de PostgreSQL
kubectl logs -n itzalan-prod statefulset/postgres

# 4. Recrear pod de DB (⚠️ precaución)
kubectl delete pod -n itzalan-prod postgres-0
```

### High Memory Usage
```bash
# Ver consumo actual
kubectl top pods -n itzalan-prod

# Aumentar límites
kubectl set resources deployment itzalan-api -n itzalan-prod \
  --limits=cpu=2000m,memory=2Gi \
  --requests=cpu=500m,memory=512Mi
```

### Rate Limiting Activo
```bash
# Ver límite actual
curl -I https://api.itzalan.com/ | grep -i x-ratelimit

# Cambiar límite (en .env)
RATE_LIMIT_MAX_REQUESTS=200

# Redeploying
kubectl set env deployment/itzalan-api \
  RATE_LIMIT_MAX_REQUESTS=200 -n itzalan-prod
```

---

## Rollback Rápido

```bash
# Ver histórico de releases
helm history itzalan -n itzalan-prod

# Rollback a versión anterior
helm rollback itzalan 1 -n itzalan-prod

# Verificar rollback completado
kubectl get pods -n itzalan-prod
kubectl logs -n itzalan-prod deployment/itzalan-api
```

---

## Comandos Útiles

```bash
# Ver todas las deployment
kubectl get all -n itzalan-prod

# Acceder a shell del pod API
kubectl exec -it -n itzalan-prod deployment/itzalan-api -- sh

# Port-forward a local
kubectl port-forward -n itzalan-prod svc/itzalan-api 3001:3001

# Escalar replicas
kubectl scale deployment itzalan-api -n itzalan-prod --replicas=3

# Ver eventos recientes
kubectl get events -n itzalan-prod --sort-by='.lastTimestamp'
```

---

## Contacto y Soporte

- **DevOps Team**: devops@itzalan.com
- **On-call**: +504 XXXX-XXXX
- **Incident Channel**: #itzalan-incidents (Slack)
- **Documentation**: https://wiki.itzalan.internal

---

**Última actualización**: 24/06/2026
**Próxima revisión**: 01/07/2026
**Responsable**: DevOps Team
