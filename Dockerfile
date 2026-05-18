FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml* .npmrc ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
ENV SERVER_PORT=3000
RUN pnpm run build

FROM node:24-alpine AS runner
ENV NODE_ENV=production
ENV SERVER_PORT=3000
ENV HOSTNAME="0.0.0.0"
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 vopads && \
  chown -R vopads:nodejs /app
USER vopads

EXPOSE ${SERVER_PORT}
CMD ["node", "dist-server/index.js"]
