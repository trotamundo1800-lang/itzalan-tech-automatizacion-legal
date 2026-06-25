FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY apps/web/package*.json ./apps/web/
COPY apps/mobile/package*.json ./apps/mobile/
COPY packages/ui/package*.json ./packages/ui/
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm --workspace @itzalan/api run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/src/migrations ./apps/api/src/migrations
COPY --from=build /app/apps/api/src/database ./apps/api/src/database
EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
