import env from '#start/env'
import { defineConfig, drivers, store } from '@adonisjs/cache'
import type { InferStores } from '@adonisjs/cache/types'

const cacheConfig = defineConfig({
  default: 'database',
  stores: {
    database: store()
      .useL1Layer(drivers.memory({ maxItems: 1_000 }))
      .useL2Layer(
        drivers.database({
          connectionName: 'cache',
          tableName: 'cache',
          autoCreateTable: true,
        })
      ),
  },
})

export default { ...cacheConfig, enabled: env.get('CACHE_ENABLED', true) }

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
