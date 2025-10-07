# 💸 SplitBill Pro

> A compact, production-ready **Next.js + Prisma** application for collaborative bill splitting

[![Node.js](https://img.shields.io/badge/node-20+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-14+-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/prisma-ORM-blue.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)

Split bills with friends, roommates, or teams easily.  
Features local dev mode with SQLite and production-ready deployment with PostgreSQL + Docker + Caddy.

---

## ✨ Features

- 🖥️ **Modern stack** — Next.js + React + TypeScript + Prisma
- 🗄️ **Dual schema** — SQLite for dev, PostgreSQL for production
- 🐳 **Dockerized** — Multi-stage image and docker-compose.yml included
- 🔒 **Reverse proxy** — Caddy integration for HTTPS out of the box
- ⚡ **Production focus** — Optimized configs, migration workflow, CI-ready

---

## 📁 Repository Structure

```

splitbill-pro/
│
├── src/                  # Next.js + React application
├── prisma/               # Prisma schemas (dev & prod) + migrations
│   ├── schema.dev.prisma
│   └── schema.prod.prisma
│
├── Dockerfile            # Multi-stage build (builder + runner)
├── docker-compose.yml    # Local deployment (app, db, caddy)
├── scripts/entrypoint.sh # Container entrypoint (migrations + app start)
├── README-DOCKER.md      # Extra Docker/Caddy deployment notes
└── ...

````

---

## 🚀 Quick Start (Development)

### Requirements
- Node.js 20+
- pnpm / npm
- (Optional) Docker & Docker Compose

### Run locally
```bash
# Install deps
npm ci

# Start dev server
npm run dev
````

👉 App available at [http://localhost:3000](http://localhost:3000)

**Notes**

* Dev schema → `prisma/schema.dev.prisma` (SQLite, `prisma/dev.db`)
* Prod schema → `prisma/schema.prod.prisma` (PostgreSQL, set `DATABASE_URL`)

---

## 🐳 Docker Deployment

This repo ships with a `Dockerfile` and `docker-compose.yml`:

Services:

* **db** — PostgreSQL (optional; SQLite if no `DATABASE_URL`)
* **app** — Next.js application
* **caddy** — Reverse proxy (optional, skip if host already runs Caddy)

### Basic workflow

```bash
# Start app (SQLite dev DB)
docker compose up -d app

# Logs
docker logs -f splitbill-pro-app-1
```

### Full stack (Postgres + App + Caddy)

```bash
docker compose up -d db app caddy
```

⚠️ **Important:** If host already runs Caddy for TLS/ACME → do **not** start `caddy` in Compose. Instead, let host Caddy reverse proxy → `127.0.0.1:3000`.

### Rebuild image

```bash
docker compose build --no-cache app
docker compose up -d app
```

---

## 🗄️ Prisma Notes

* Default imports → dev client (`@prisma/client/dev`)
* Docker build generates **dev client** by default
* For production:

  * Switch to `@prisma/client`
  * Generate client from `schema.prod.prisma`

### Example commands

```bash
npm run db:gen:prod   # generate prod client
npm run db:mig:prod   # run migrations on DATABASE_URL
```

---

## 🔐 Caddy & TLS

* Local testing → `Caddyfile` examples included
* Recommended production → run Caddy as system service (`reverse_proxy 127.0.0.1:3000`)
* Containerized Caddy → optional, start via Compose profile to avoid conflicts

---

## 🛠️ Troubleshooting

* **502 via Caddy** → app not listening or wrong proxy target
* **Prisma OpenSSL warnings** → ensure `openssl` + `ca-certificates` installed
* **Port conflicts (80/443)** → avoid running two Caddy instances (host + container)

---

## 🤝 Contributing

We welcome PRs! Please ensure:

* `npm ci` & `npm run build` succeed locally
* Prisma generation included in CI if schema changes
* No secrets committed — use env vars / repo secrets

---

## 📜 License

MIT © 2025 — See [LICENSE](LICENSE)

---

**Built with ❤️ for simplifying shared expenses**