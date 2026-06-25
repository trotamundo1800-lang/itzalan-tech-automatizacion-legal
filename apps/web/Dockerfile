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
RUN npm --workspace @itzalan/web run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/apps/web/.next ./apps/web/.next
COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=build /app/apps/web/next-env.d.ts ./apps/web/next-env.d.ts
COPY --from=build /app/apps/web/package.json ./apps/web/package.json
EXPOSE 3000
CMD ["npm", "--workspace", "@itzalan/web", "run", "start"]
