# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.3-alpine AS base
WORKDIR /app

# Install dependencies into temp directory
FROM base AS deps
# Copy only package.json and bun.lock to leverage layer caching
COPY package.json bun.lock ./
# Install production dependencies first
RUN --mount=type=cache,target=/root/.bun \
  bun install --frozen-lockfile --production
# Install dev dependencies for build
RUN --mount=type=cache,target=/root/.bun \
  bun install --frozen-lockfile

# Builder stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
# Copy necessary source files
COPY . .
# Set production environment
ENV NODE_ENV=production
ENV SERVER_PORT=3000
# Build the application
RUN bun run build

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
USER bun
EXPOSE ${SERVER_PORT}
CMD ["bun", "server.js"]