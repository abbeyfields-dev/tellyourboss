#!/bin/sh
set -e
if [ "${SKIP_MIGRATIONS_ON_START:-}" = "true" ]; then
  echo "[entrypoint] SKIP_MIGRATIONS_ON_START=true — skipping prisma migrate deploy"
else
  echo "[entrypoint] prisma migrate deploy"
  npx prisma migrate deploy
fi
exec node dist/index.js
