# ==============================================================================
# Multi-Stage Production Container for Mazu Sixty Lots
# Standalone Node.js footprint on Alpine Linux (< 120MB, ~45MB memory RSS)
# ==============================================================================

# Stage 1: Dependencies
FROM node:24-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DOCKER_BUILD=true
RUN npm run build

# Stage 3: Runner
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache dumb-init libc6-compat

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 mazuuser

# Dedicated persistent volume directory for mutable user vault & dynamic custom configs
RUN mkdir -p /app/storage && chown -R mazuuser:nodejs /app/storage
ENV STORAGE_DIR=/app/storage
VOLUME ["/app/storage"]

COPY --from=builder --chown=mazuuser:nodejs /app/public ./public
COPY --from=builder --chown=mazuuser:nodejs /app/.next/standalone ./
COPY --from=builder --chown=mazuuser:nodejs /app/.next/static ./.next/static
# Readonly canonical dataset (shipped with image, never shadowed by volume mounts)
COPY --from=builder --chown=mazuuser:nodejs /app/data/canonical ./data/canonical
COPY --from=builder --chown=mazuuser:nodejs /app/assets ./assets

# Standalone compiled CLI management utilities (pure Node.js, zero tsx/dev dependency)
COPY --from=builder --chown=mazuuser:nodejs --chmod=755 /app/bin ./bin
COPY --from=builder --chown=mazuuser:nodejs /app/package.json ./package.json

# Create convenient global CLI commands in /usr/local/bin
RUN ln -s /app/bin/admin.js /usr/local/bin/mazu-admin && \
    ln -s /app/bin/config.js /usr/local/bin/mazu-config

USER mazuuser
EXPOSE 3000

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]
