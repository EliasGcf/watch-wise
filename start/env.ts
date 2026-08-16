/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Database
  DATABASE_NAME: Env.schema.string.optional(),
  CACHE_DATABASE_NAME: Env.schema.string.optional(),

  // Cache
  CACHE_ENABLED: Env.schema.boolean.optional(),

  // Catalog Provider
  CATALOG_PROVIDER_DRIVER: Env.schema.enum(['fake', 'tmdb'] as const),
  TMDB_ACCESS_TOKEN: Env.schema.string.optionalWhen(process.env.CATALOG_PROVIDER_DRIVER === 'fake'),

  // Sonarr Provider
  SONARR_PROVIDER_DRIVER: Env.schema.enum.optional(['fake', 'sonarr'] as const),
  SONARR_URL: Env.schema.string.optionalWhen(process.env.SONARR_PROVIDER_DRIVER !== 'sonarr', {
    format: 'url',
    tld: false,
  }),
  SONARR_API_KEY: Env.schema.string.optionalWhen(process.env.SONARR_PROVIDER_DRIVER !== 'sonarr'),

  // Radarr Provider
  RADARR_PROVIDER_DRIVER: Env.schema.enum.optional(['fake', 'radarr'] as const),
  RADARR_URL: Env.schema.string.optionalWhen(process.env.RADARR_PROVIDER_DRIVER !== 'radarr', {
    format: 'url',
    tld: false,
  }),
  RADARR_API_KEY: Env.schema.string.optionalWhen(process.env.RADARR_PROVIDER_DRIVER !== 'radarr'),

  // Seerr Webhook
  SEERR_USERNAME: Env.schema.string.optional(),
  SEERR_AUTH_HEADER: Env.schema.secret.optional(),
})
