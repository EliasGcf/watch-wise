# Watch Wise

Watch Wise is a personal watch-tracking app for movies and series. It lets a user search a catalog, save titles to their library, and track watched movies and episodes over time.

The app keeps the catalog separate from the user's library: external providers supply searchable movie and series data, while Watch Wise stores the user's saved entries, watched marks, and derived progress.

## Stack

- AdonisJS 7
- Inertia + React 19
- SQLite through Lucid
- Tailwind CSS 4 and shadcn/ui
- Bun
- TMDB as the real catalog provider, with a fake provider for test

## Requirements

- Bun 1.3.14
- SQLite support through the installed `sqlite3` package
- A TMDB access token only when using `CATALOG_PROVIDER_DRIVER=tmdb`

## Setup

Install dependencies:

```bash
bun install
```

Create the local environment file:

```bash
cp .env.example .env
```

The `.env.example` file starts with the fake catalog provider only as a safe default. For development and real execution, use TMDB instead.

Prepare the database:

```bash
bun run db:reset
```

Start the development server:

```bash
bun run dev
```

By default the app runs at `http://localhost:3333`.

## Catalog Provider

For development and real execution, use TMDB:

```env
CATALOG_PROVIDER_DRIVER=tmdb
TMDB_ACCESS_TOKEN=your_token
```

The fake provider is intended for tests and controlled scenarios only:

```env
CATALOG_PROVIDER_DRIVER=fake
```

## Useful Commands

```bash
bun run dev          # start the app in watch mode
bun run start        # start the server without watch mode
bun run db:reset     # recreate and seed the local SQLite database
bun run lint         # run ESLint
bun run typecheck    # run TypeScript checks
bun run vite:build   # build frontend assets
```

Project terminology lives in `CONTEXT.md`. Architectural decisions live in `docs/adr/`.
