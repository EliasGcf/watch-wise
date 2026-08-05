import { client as radarrClient } from '#generated/radarr/client.gen'
import { RadarrSdk } from '#generated/radarr/sdk.gen'
import {
  RadarrProvider,
  RadarrProviderError,
  type RadarrProviderDriverConfig,
} from '#providers/radarr/types'

export default class RadarrProviderDriver extends RadarrProvider {
  constructor(config: RadarrProviderDriverConfig, radarr: RadarrSdk = new RadarrSdk()) {
    super()

    if (!config.baseUrl) throw new RadarrProviderError('Radarr base URL is required.')
    if (!config.apiKey) throw new RadarrProviderError('Radarr API key is required.')

    radarrClient.setConfig({ baseUrl: config.baseUrl, headers: { 'X-Api-Key': config.apiKey } })
  }
}
