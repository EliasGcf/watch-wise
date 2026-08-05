/* eslint-disable @unicorn/filename-case */
import { defineConfig, OperationPath } from '@hey-api/openapi-ts'

export default defineConfig([
  {
    input: './public/tmdb-api.json',
    output: './.adonisjs/server/tmdb',
    plugins: [
      {
        name: '@hey-api/sdk',
        operations: {
          containerName: 'tmdbSdk',
          strategy: 'single',
          nesting: (operation) => {
            return OperationPath.fromOperationId({ delimiters: /[-_]/ })(operation)
          },
        },
      },
      '@faker-js/faker',
    ],
  },
  {
    input: './public/sonarr-api.json',
    output: './.adonisjs/server/sonarr',
    plugins: [
      {
        name: '@hey-api/sdk',
        operations: {
          containerName: 'sonarrSdk',
          strategy: 'single',
        },
      },
    ],
  },
])
