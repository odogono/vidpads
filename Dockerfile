# Use Node.js as base image
FROM node:23-alpine AS base
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
# Copy package configs
COPY package.json pnpm-lock.yaml* ./
# Install production dependencies
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile --prod
# Install all dependencies for build
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set production environment
ENV NODE_ENV=production
ENV SERVER_PORT=3000
# Build the application
RUN pnpm run build

# Production stage
FROM base AS runner
ENV NODE_ENV=production
ENV SERVER_PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

# Copy only the necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Use non-root user
RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nextjs && \
  chown -R nextjs:nodejs /app
USER nextjs

EXPOSE ${SERVER_PORT}
CMD ["node", "server.js"]