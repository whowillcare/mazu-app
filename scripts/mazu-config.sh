#!/bin/sh
STORAGE_PATH="${STORAGE_DIR:-/app/storage}"
if [ "$(id -u)" = '0' ]; then
    if [ -d "$STORAGE_PATH" ]; then
        chown -R mazuuser:nodejs "$STORAGE_PATH" 2>/dev/null || true
    fi
    exec su-exec mazuuser:nodejs node /app/bin/config.js "$@"
else
    exec node /app/bin/config.js "$@"
fi
