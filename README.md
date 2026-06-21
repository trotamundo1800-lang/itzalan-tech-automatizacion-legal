# ITZALAN TECH – AUTOMATIZACIÓN LEGAL

Monorepo de ejemplo para una plataforma LegalTech con web, backend y aplicación móvil.

## Directorio

- `apps/web` - Frontend Next.js
- `apps/api` - Backend NestJS
- `apps/mobile` - App móvil Expo
- `packages/ui` - Paquete compartido de UI

## Comandos

Desde la raíz:

```bash
npm install
npm run dev
npm run dev:api
npm run dev:mobile
```

## Infraestructura

- `docker-compose.yml`: PostgreSQL y Qdrant

## API Backend

- `apps/api` usa NestJS con JWT, Passport y TypeORM
- `apps/api` está configurado para conectar a PostgreSQL usando:
  - `DB_TYPE=postgres` (por defecto)
  - `DB_HOST` (por defecto `localhost`)
  - `DB_PORT` (por defecto `5432`)
  - `DB_USER` (por defecto `itzalan`)
  - `DB_PASSWORD` (por defecto `changeme`)
  - `DB_NAME` (por defecto `itzalan`)
- También puede usar SQLite para desarrollo local:
  - `DB_TYPE=sqlite`
  - `DB_NAME=database.sqlite`

## Autenticación

- Rutas disponibles:
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/profile` (requiere JWT)
  - `POST /auth/refresh` (refresh token en body)
  - `POST /auth/logout` (acepta `refreshToken` en el body y lo invalida)
  - `GET /users` (requiere rol `admin`)

- Los roles soportados son:
  - `admin`
  - `abogado`
  - `asistente`
  - `cliente`

  Detalles de logout:
  - `POST /auth/logout` debe recibir `{ "refreshToken": "..." }` en el cuerpo.
  - El servidor valida el refresh token y borra el `refreshToken` almacenado para el usuario asociado, invalidando sesiones posteriores.

  Endpoints y puertos por defecto (desarrollo):
  - API: http://localhost:3001
  - Web: http://localhost:3000

- `apps/web` usa `NEXT_PUBLIC_API_URL` para configurar la URL de la API:
  - `NEXT_PUBLIC_API_URL=http://localhost:3001`
- `apps/mobile` usa `apps/mobile/app/lib/api.ts` para consumir la API en `http://localhost:3001`

## Notas

- Cambia `CHANGE_THIS_SECRET_TO_A_STRONG_VALUE` en `apps/api/src/auth/constants.ts` antes de producción.
- `synchronize: true` es útil para desarrollo, pero en producción es mejor usar migraciones.
