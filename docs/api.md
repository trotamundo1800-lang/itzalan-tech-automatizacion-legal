# API

## Autenticacion
- JWT Bearer para endpoints protegidos
- Refresh token para renovacion de sesion
- Guards por rol para permisos sensibles

## Endpoints prioritarios

### Autenticacion
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/me

### Ejemplo de autenticacion (login)
POST /api/auth/login

Request:
{
	"email": "usuario@correo.com",
	"password": "******"
}

Response:
{
	"token": "jwt",
	"user": {}
}

### Usuarios
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PATCH /api/users/:id
- DELETE /api/users/:id

### Clientes
- GET /api/clients
- GET /api/clients/:id
- POST /api/clients
- PATCH /api/clients/:id
- DELETE /api/clients/:id

### Expedientes
- GET /api/cases
- GET /api/cases/:id
- POST /api/cases
- PATCH /api/cases/:id
- DELETE /api/cases/:id

### Documentos
- GET /api/documents
- POST /api/documents/upload
- GET /api/documents/:id
- DELETE /api/documents/:id

### Agenda Procesal
- GET /api/calendar/events
- POST /api/calendar/events
- PATCH /api/calendar/events/:id
- DELETE /api/calendar/events/:id

### IA Juridica
- POST /api/ai/chat
- POST /api/ai/analyze-contract
- POST /api/ai/analyze-lawsuit
- POST /api/ai/analyze-sentence
- POST /api/ai/generate-document

### Prestaciones Laborales
- POST /api/labor/calculate-benefits
- POST /api/labor/generate-settlement
- POST /api/labor/generate-claim

### Avaluos
- POST /api/appraisals/create
- GET /api/appraisals/:id
- POST /api/appraisals/export-pdf

### Facturacion
- GET /api/invoices
- POST /api/invoices
- PATCH /api/invoices/:id
- DELETE /api/invoices/:id

### Suscripciones
- GET /api/subscriptions/plans
- POST /api/subscriptions/checkout
- POST /api/subscriptions/cancel

### Suscripciones (implementacion actual)
- GET /api/subscriptions/me
- POST /api/subscriptions/checkout/stripe
- POST /api/subscriptions/checkout/paypal
- POST /api/subscriptions/webhook/paypal
- POST /api/subscriptions/webhooks/stripe
- POST /api/subscriptions/webhooks/paypal
- Catalogo actual de planes: Basico (USD 19), Profesional (USD 49), Empresarial (USD 99), Enterprise (desde USD 299)

Request checkout:
{
	"planId": "<plan-id>"
}

Response esperada (demo):
{
	"message": "Suscripción activada con Stripe",
	"provider": "stripe",
	"checkoutMode": "sandbox"
}

Nota: en entorno local/desarrollo el checkout es simulado, por lo que no genera cobros reales.

### Webhooks de pago (esqueleto)
- Stripe webhook endpoint: POST /api/subscriptions/webhooks/stripe
- PayPal webhook endpoint: POST /api/subscriptions/webhooks/paypal
- PayPal webhook endpoint nuevo: POST /api/subscriptions/webhook/paypal
- Header opcional de seguridad (recomendado): x-webhook-secret
- Header de proveedor (si existe):
	- Stripe: stripe-signature
	- PayPal: paypal-transmission-sig

### Variables requeridas para PayPal producción
- PAYPAL_CLIENT_ID
- PAYPAL_SECRET
- PAYPAL_MODE=sandbox|live
- PAYPAL_WEBHOOK_ID
- APP_URL
- API_URL

Respuesta base de webhook:
{
	"received": true,
	"provider": "stripe",
	"eventType": "customer.subscription.deleted",
	"verified": true,
	"mode": "sandbox"
}

### Portal del Cliente
- GET /api/client-portal/cases
- GET /api/client-portal/documents
- GET /api/client-portal/invoices
- GET /api/client-portal/calendar

## Payloads
Cada endpoint usa DTOs validados en backend. Recomendado documentar ejemplos JSON por modulo en una siguiente iteracion.

## Permisos
- admin: gestion global
- abogado: operacion juridica completa
- asistente: operacion limitada por modulo
- cliente: acceso restringido a su portal y recursos permitidos
