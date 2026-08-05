import { client as sonarrClient } from '#generated/sonarr/client.gen'
import { SonarrSdk } from '#generated/sonarr/sdk.gen'
import {
  SonarrProvider,
  SonarrProviderError,
  type SonarrProviderDriverConfig,
} from '#providers/sonarr/types'

export default class SonarrProviderDriver extends SonarrProvider {
  constructor(
    config: SonarrProviderDriverConfig,
    private sonarr: SonarrSdk = new SonarrSdk()
  ) {
    super()

    if (!config.baseUrl) throw new SonarrProviderError('Sonarr base URL is required.')
    if (!config.apiKey) throw new SonarrProviderError('Sonarr API key is required.')

    sonarrClient.setConfig({ baseUrl: config.baseUrl, headers: { 'X-Api-Key': config.apiKey } })
  }
}
