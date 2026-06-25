# Base de Datos

## Modelo entidad-relacion
El modelo se organiza en dominios: identidad, clientes, expedientes, documentos, agenda, suscripciones, facturacion, auditoria e IA.

## Tablas principales
- users
- roles
- user_roles
- clients
- expedientes
- legal_documents
- contract_drafts
- agenda_events
- subscriptions
- subscription_plans
- payments
- invoices
- ai_requests
- ai_results
- audit_logs

## Indices
- Indices por llaves foraneas (client_id, expediente_id, user_id)
- Indices por fecha para timeline y agenda
- Indices por estado para bandejas operativas
- Indices de texto para busqueda documental

## Relaciones
- Un cliente tiene muchos expedientes
- Un expediente tiene muchos documentos y eventos
- Un usuario puede tener uno o varios roles
- Una suscripcion pertenece a un usuario y un plan
- Los logs de auditoria referencian usuario, accion y entidad

## Mapa jerarquico de relaciones

users
 - clients
 - cases
 - invoices
 - subscriptions

clients
 - cases
 - documents
 - appointments

cases
 - documents
 - ai_analysis
 - reminders
 - timeline

## Auditoria
- Registro de cambios por entidad critica
- Trazabilidad de inicio/cierre de sesion
- Registro de operaciones de IA (entrada, salida, timestamp, actor)
- Politica de retencion definida por cumplimiento
