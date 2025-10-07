FROM node:20-slim AS builder
WORKDIR /app

# Ensure OpenSSL is available during build (Prisma needs libssl detection)
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Copy package files first to leverage layer caching
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY tsconfig.json ./

# Install dependencies (dev dependencies needed for build)
# Use `npm install` here to avoid failing when package-lock.json is out of
# sync in this development iteration. For production CI, prefer `npm ci`.
RUN npm install --legacy-peer-deps

# Generate Prisma client (development schema is used because the code imports
# `@prisma/client/dev` in many places). If you prefer the production client,
# see docs below about switching imports to `@prisma/client` and using the
# `schema.prod.prisma` generator.
RUN npm run db:gen:dev

# Copy the rest of the source and build
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built app and installed modules
COPY --from=builder /app /app

# Ensure OpenSSL is available at runtime for Prisma
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

EXPOSE 3000

# Use an entrypoint that runs migrations (optional) and starts the server
COPY ./scripts/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

CMD ["/usr/local/bin/entrypoint.sh"]
