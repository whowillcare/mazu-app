# ==============================================================================
# Multi-Stage Production Container for Mazu Sixty Lots
# Standalone Node.js footprint on Alpine Linux (< 120MB, ~45MB memory RSS)
# ==============================================================================

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true
RUN npm run build

# Stage 3: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache dumb-init

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 mazuuser

# Persistent volume directory for SQLite database
RUN mkdir -p /app/data && chown -R mazuuser:nodejs /app/data
VOLUME ["/app/data"]

COPY --from=builder --chown=mazuuser:nodejs /app/public ./public
COPY --from=builder --chown=mazuuser:nodejs /app/.next/standalone ./
COPY --from=builder --chown=mazuuser:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=mazuuser:nodejs /app/data/canonical ./data/canonical
COPY --from=builder --chown=mazuuser:nodejs /app/assets ./assets

USER mazuuser
EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
