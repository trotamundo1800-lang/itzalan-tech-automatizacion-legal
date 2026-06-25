# Arquitectura

## Arquitectura frontend
- Next.js (App Router)
- UI modular por rutas y componentes reutilizables
- Consumo de API REST con autenticacion JWT

## Arquitectura backend
- NestJS modular por dominios
- Controladores, servicios y DTOs por modulo
- Autenticacion y autorizacion con JWT + roles

## Arquitectura movil
- Expo + React Native
- Capa de servicios para consumir API
- Navegacion orientada a flujos juridicos clave

## Servicios externos
- Pasarelas de pago
- Proveedores de mensajeria/correo
- Almacenamiento de archivos
- Observabilidad y monitoreo

## IA
- Capa de orquestacion para prompts y herramientas
- Agentes especializados por dominio juridico
- Salidas auditables con trazabilidad de acciones

## n8n
- Flujos automatizados para recordatorios, cobros, marketing y seguimiento de casos
- Webhooks para disparar acciones desde eventos internos

## Base de datos
- PostgreSQL como motor principal
- SQLite para desarrollo local
- Entidades separadas por dominios funcionales

## Infraestructura
- Contenedores Docker en desarrollo y despliegue
- Pipelines CI/CD con validaciones de build y pruebas
- Backups y politicas de recuperacion
