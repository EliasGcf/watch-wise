import { defineConfig, drivers, store } from '@adonisjs/cache'
import type { InferStores } from '@adonisjs/cache/types'

const cacheConfig = defineConfig({
  default: 'database',
  stores: {
    database: store().useL2Layer(
      drivers.database({
        connectionName: 'cache',
        tableName: 'cache',
        autoCreateTable: true,
      })
    ),
  },
})

export default cacheConfig

declare module '@adonisjs/cache/types' {
  interface CacheStores extends InferStores<typeof cacheConfig> {}
}
