#!/usr/bin/env bash
set -euo pipefail

echo "Starting entrypoint script..."

if [ -z "${DATABASE_URL:-}" ]; then
  echo "WARNING: DATABASE_URL is not set. Skipping migrations."
else
  # Detect sqlite vs network DB
  if echo "$DATABASE_URL" | grep -q '^file:'; then
    echo "Detected sqlite DATABASE_URL; skipping network wait and migrate deploy."
  else
    echo "Waiting for database to be available..."
    # parse host and port from DATABASE_URL and try to connect to it
    DB_HOST="$(node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.hostname || 'db')")"
    DB_PORT="$(node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.port || '5432')")"

    # simple wait loop
    until node -e "require('net').createConnection({host: process.env.DB_HOST || '${DB_HOST}', port: process.env.DB_PORT || ${DB_PORT}}).on('connect', ()=>{console.log('ok'); process.exit(0)}).on('error', ()=>{})" 2>/dev/null; do
      sleep 1
      echo -n '.'
    done

    echo "Running Prisma migrate deploy (if any)..."
    npx prisma migrate deploy --schema prisma/schema.prod.prisma || true
  fi
fi

echo "Starting Next.js server..."
exec npm run start -- --port ${PORT:-3000}
