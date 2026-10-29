#!/bin/sh
set -e

STORAGE_PATH="${STORAGE_DIR:-/app/storage}"

# If started as root (e.g. host volume mount initialization), ensure ownership & permissions
if [ "$(id -u)" = '0' ]; then
    mkdir -p "$STORAGE_PATH"
    chown -R mazuuser:nodejs "$STORAGE_PATH"
    chmod 775 "$STORAGE_PATH"

    # Repair any existing files in storage that might have been mounted as root
    find "$STORAGE_PATH" -type f -exec chown mazuuser:nodejs {} + 2>/dev/null || true
    find "$STORAGE_PATH" -type f -exec chmod 664 {} + 2>/dev/null || true

    # Drop root privileges and exec command strictly as unprivileged mazuuser (UID 1001:1001)
    exec su-exec mazuuser:nodejs /usr/bin/dumb-init -- "$@"
fi

# Fallback if already running as unprivileged user
exec /usr/bin/dumb-init -- "$@"
