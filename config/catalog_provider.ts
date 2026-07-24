import env from '#start/env'
import type { CatalogProviderConfig } from '#providers/catalog_provider/types'

const catalogProviderConfig: CatalogProviderConfig = {
  default: env.get('CATALOG_PROVIDER_DRIVER'),
  drivers: {
    fake: {
      failureQuery: 'fail',
    },
    tmdb: {
      accessToken: env.get('TMDB_ACCESS_TOKEN'),
    },
  },
}

export default catalogProviderConfig
