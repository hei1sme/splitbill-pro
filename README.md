# SplitBill Pro

A compact, production-oriented Next.js application for collaborative bill splitting, built with TypeScript and Prisma.

This repository contains the application source, Prisma schemas (development and production), and artifacts to run the app locally or in Docker with Caddy as a reverse proxy.

---

## Contents
- `src/` — application source (Next.js + React)
- `prisma/` — Prisma schemas and migration artifacts
- `Dockerfile` — multi-stage Dockerfile (builder + runner)
- `docker-compose.yml` — convenience Compose file for local deployment (app, db, caddy)
- `scripts/entrypoint.sh` — container entrypoint to run migrations and start the app
- `README-DOCKER.md` — extra notes about Docker deployment and Caddy

---

## Quick start (development)

Requirements
- Node.js 20+ (recommended)
- pnpm / npm
- (Optional) Docker & Docker Compose for containerized runs

Install and run locally:

```bash
# Install dependencies
npm ci

# Start development server
npm run dev
```

Open http://localhost:3000 to view the app locally.

Notes
- The repository contains a development Prisma schema (`prisma/schema.dev.prisma`) that uses SQLite (`prisma/dev.db`).
- The production schema (`prisma/schema.prod.prisma`) targets PostgreSQL and should be used for production deployments.

---

## Docker (recommended for server deployment)

This project includes a multi-stage `Dockerfile` and `docker-compose.yml` for convenience. The compose file provides three services:
- `db` — PostgreSQL (optional; compose defaults to SQLite `prisma/dev.db` if no `DATABASE_URL` provided)
- `app` — the Next.js application
- `caddy` — Caddy reverse proxy (optional; if you already run Caddy on the host, do not start this service to avoid port conflicts)

Basic workflow (run from repository root):

```bash
# Build and start app (uses sqlite dev DB by default)
docker compose up -d app

# Follow logs
docker logs -f splitbill-pro-app-1
```

If you want the full stack including Postgres and Caddy:

```bash
docker compose up -d db app caddy
```

Important: If you already run Caddy as a system service on the host (common for TLS/ACME management), do NOT start the `caddy` service from Compose — that will also bind ports 80/443 and cause conflicts. Use the system Caddy to proxy to the app instead.

To rebuild the app image after changes:

```bash
docker compose build --no-cache app
docker compose up -d app
```

---

## Prisma notes

- The codebase currently imports the development Prisma client (`@prisma/client/dev`), and the Dockerfile generates the dev client during the build. For production, switch imports to `@prisma/client` and generate a production client using `schema.prod.prisma`.
- If you plan to use PostgreSQL in production, set `DATABASE_URL` to your Postgres connection string and run migrations with `prisma migrate deploy`.

Example migration commands (CI or server entrypoint):

```bash
npm run db:gen:prod   # generate production client (if configured)
npm run db:mig:prod   # run migrations against DATABASE_URL
```

---

## Notes about Caddy and TLS

- This repository includes `Caddyfile` examples for local testing. If you run Caddy on the host as a systemd service (recommended for a single reverse proxy), add a `reverse_proxy` block that forwards your domain to `127.0.0.1:3000` and let system Caddy handle certificates.
- If you prefer containerized Caddy, start it explicitly via Compose. To avoid accidental conflicts, consider adding a Compose profile so Caddy starts only when requested.

---

## Troubleshooting

- 502 errors via Caddy: typically mean the upstream app is not listening. Confirm the app is running and listening on port 3000 inside Docker (or on the host) and that Caddy is proxying to the correct address.
- Prisma OpenSSL warnings: the Docker image installs OpenSSL so Prisma can detect libssl at runtime. If you see issues, ensure the image includes `openssl` and `ca-certificates`.
- Port conflicts on 80/443: stop/remove any dockerized Caddy containers before starting the system Caddy, or use a single Caddy approach.

---

## Contributing

Contributions are welcome. When submitting PRs, keep these in mind:
- Run `npm ci` and `npm run build` locally
- Ensure Prisma client generation steps are included in CI if you change the schema
- Avoid committing secrets — add them to repository Secrets or environment variables instead

---

If you'd like, I can add a GitHub Actions workflow that builds the project and optionally builds/pushes a Docker image to a registry. Say the word and I will add a minimal CI next.
