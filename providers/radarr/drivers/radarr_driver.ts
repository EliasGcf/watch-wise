import { client as radarrClient } from '#generated/radarr/client.gen'
import { RadarrSdk } from '#generated/radarr/sdk.gen'
import {
  RadarrProvider,
  RadarrProviderError,
  type RadarrProviderDriverConfig,
} from '#providers/radarr/types'

export default class RadarrProviderDriver extends RadarrProvider {
  constructor(
    config: RadarrProviderDriverConfig,
    private radarr: RadarrSdk = new RadarrSdk()
  ) {
    super()

    if (!config.baseUrl) throw new RadarrProviderError('Radarr base URL is required.')
    if (!config.apiKey) throw new RadarrProviderError('Radarr API key is required.')

    radarrClient.setConfig({ baseUrl: config.baseUrl, headers: { 'X-Api-Key': config.apiKey } })
  }

  async deleteMovieFileByCatalogProviderId(providerId: string) {
    const moviesResponse = await this.radarr.getApiV3Movie()

    if (moviesResponse.error) {
      throw new RadarrProviderError('Radarr movie request failed', {
        cause: moviesResponse.error,
      })
    }

    const movie = (moviesResponse.data ?? []).find((item) => String(item.tmdbId) === providerId)

    if (!movie?.hasFile || !movie.movieFileId) return

    const deleteResponse = await this.radarr.deleteApiV3MoviefileById({
      path: { id: movie.movieFileId },
    })

    if (deleteResponse.error) {
      throw new RadarrProviderError('Radarr movie file deletion failed', {
        cause: deleteResponse.error,
      })
    }
  }
}
