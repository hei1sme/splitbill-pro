# Running splitbill-pro with Docker, Postgres and Caddy (Ubuntu)

This guide shows how to run the project using Docker Compose and Caddy as a reverse proxy on a Linux (Ubuntu) server.

Prerequisites

- Docker and Docker Compose installed on the server.
- A domain name pointing to the server's public IP (for automatic TLS via Caddy).

Quick steps

1. Copy `.env.example` to `.env` and edit if needed.
2. Update `Caddyfile` and replace `example.com` with your real domain.
3. Start the stack:

```bash
docker compose up -d --build
```

What the compose stack includes

- db: Postgres 15
- app: Next.js production build (runs `npm run build` during image build and `npm run start` on container start).
- caddy: Reverse proxy with automatic TLS (listens on 80/443).

Prisma and the generated client

This repo currently uses `@prisma/client/dev` in source files and the `db:gen:dev` script to generate the client into `node_modules/.prisma/client-dev`. The Dockerfile runs `npm run db:gen:dev` during build to avoid runtime errors.

For a production setup you may want to:

- Replace imports from `@prisma/client/dev` to `@prisma/client` in `src/`.
- Update `tsconfig.json` `paths` mapping and run `npm run db:gen:prod` to generate the production client defined by `prisma/schema.prod.prisma`.

Running migrations

The `entrypoint.sh` runs `npx prisma migrate deploy --schema prisma/schema.prod.prisma` if `DATABASE_URL` is set. If you want to apply migrations during the build step instead, run them on the host and bake the data.

Notes and troubleshooting

- If Caddy fails to provision certificates, check that port 80/443 are open and your DNS records point to the server.
- If the app cannot reach Postgres on startup, confirm `DATABASE_URL` is correct and the `db` service is healthy.
- Logs: use `docker compose logs -f app` or `docker compose logs -f caddy` for diagnostics.
