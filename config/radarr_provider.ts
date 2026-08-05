import env from '#start/env'
import type { RadarrProviderConfig } from '#providers/radarr/types'

const radarrProviderConfig: RadarrProviderConfig = {
  default: env.get('RADARR_PROVIDER_DRIVER'),

  drivers: {
    fake: {},
    radarr: {
      baseUrl: env.get('RADARR_URL'),
      apiKey: env.get('RADARR_API_KEY'),
    },
  },
}

export default radarrProviderConfig
