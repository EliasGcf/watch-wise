# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.14-alpine AS dev-deps
WORKDIR /usr/src/app

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile && bun pm cache rm

FROM dev-deps AS build
COPY . .
RUN bun run vite:build \
  && rm -rf public/assets \
  && mkdir -p public \
  && cp -R build/public/assets public/assets \
  && mkdir -p data \
  && rm -rf build node_modules

FROM oven/bun:1.3.14-alpine AS prod-deps
WORKDIR /usr/src/app

COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile --production && bun pm cache rm

FROM oven/bun:1.3.14-alpine AS release
WORKDIR /usr/src/app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333
ENV LOG_LEVEL=info
ENV APP_URL=http://localhost:3333
ENV SESSION_DRIVER=cookie
ENV DATABASE_NAME=data/db.sqlite3
ENV CACHE_DATABASE_NAME=data/cache.sqlite3
ENV CATALOG_PROVIDER_DRIVER=tmdb

# copy source files. This project runs TypeScript directly with Bun.
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app ./
RUN mkdir -p data && chown -R 1000:1000 /usr/src/app

# run the app
USER 1000:1000
EXPOSE 3333/tcp
ENTRYPOINT [ "sh", "-c", "bun --bun bin/console.ts migration:run --force && exec bun bin/server.ts" ]
