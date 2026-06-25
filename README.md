# ITZALAN TECH - Automatizacion Legal

![ITZALAN TECH](apps/web/public/brand/itzalan-logo.svg)

## Descripcion del proyecto
ITZALAN TECH es una plataforma LegalTech SaaS (web + app movil) para abogados y despachos juridicos de Honduras y Centroamerica. Centraliza gestion de clientes, expedientes, documentos, agenda, suscripciones y capacidades de inteligencia artificial juridica.

## Tecnologias utilizadas
- Frontend web: Next.js (App Router) + React + Tailwind CSS
- Backend API: NestJS + TypeORM + JWT + Passport
- App movil: Expo + React Native
- Base de datos: PostgreSQL (principal) y SQLite (desarrollo)
- Infraestructura local: Docker Compose
- Monorepo: npm workspaces

## Instalacion
1. Instalar dependencias del monorepo:
   - npm install
2. Configurar variables de entorno segun cada app (API, web y mobile).

## Ejecucion local
- Web:
  - npm run dev
- API:
  - npm run dev:api
- App movil:
  - npm run dev:mobile

Puertos comunes en desarrollo:
- Web: http://localhost:3000
- API: http://localhost:3001

## Estructura general
- apps/web: Frontend web
- apps/api: Backend API
- apps/mobile: Aplicacion movil
- packages/ui: Componentes compartidos
- docs: Documentacion funcional y tecnica del proyecto

## Modulo de suscripciones
- Ruta web: /suscripciones
- Planes activos: Basico (USD 19), Profesional (USD 49), Empresarial (USD 99), Enterprise (desde USD 299)
- Acciones disponibles: activar por Stripe/PayPal y cancelar suscripcion
- Modo de pago actual: sandbox/demo (sin cobro real)
- Webhooks base: /api/subscriptions/webhooks/stripe y /api/subscriptions/webhooks/paypal

## Enlaces a la documentacion
- [Indice de documentacion](docs/README.md)
- [Despliegue VPS](docs/vps-despliegue.md)
- [Vision de producto](docs/vision-producto.md)
- [Estructura maestra](docs/estructura-maestra.md)
- [Arquitectura](docs/arquitectura.md)
- [Base de datos](docs/base-datos.md)
- [API](docs/api.md)
- [Agentes IA](docs/agentes-ia.md)
- [Automatizaciones n8n](docs/automatizaciones-n8n.md)
- [Roadmap](docs/roadmap.md)
- [Despliegue](docs/despliegue.md)
- [Seguridad](docs/seguridad.md)
- [Planes de suscripcion](docs/planes-suscripcion.md)
- [App movil](docs/app-movil.md)
- [Modulos juridicos](docs/modulos-juridicos.md)
- [Modulos laborales](docs/modulos-laborales.md)
- [Modulos inmobiliarios](docs/modulos-inmobiliarios.md)
- [Marketing juridico](docs/marketing-juridico.md)
- [Integraciones](docs/integraciones.md)
