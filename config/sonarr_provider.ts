import env from '#start/env'
import type { SonarrProviderConfig } from '#providers/sonarr/types'

const sonarrProviderConfig: SonarrProviderConfig = {
  default: env.get('SONARR_PROVIDER_DRIVER'),

  drivers: {
    fake: {},
    sonarr: {
      baseUrl: env.get('SONARR_URL'),
      apiKey: env.get('SONARR_API_KEY'),
    },
  },
}

export default sonarrProviderConfig
