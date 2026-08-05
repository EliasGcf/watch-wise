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

  async deleteEpisodeFileByCatalogProviderId(providerId: string, season: number, episode: number) {
    const seriesResponse = await this.sonarr.getApiV3Series()

    if (seriesResponse.error) {
      throw new SonarrProviderError('Sonarr series request failed', { cause: seriesResponse.error })
    }

    const serie = (seriesResponse.data ?? []).find((item) => String(item.tmdbId) === providerId)

    if (!serie?.id) return

    const episodesResponse = await this.sonarr.getApiV3Episode({
      query: { seriesId: serie.id, seasonNumber: season, includeEpisodeFile: true },
    })

    if (episodesResponse.error) {
      throw new SonarrProviderError('Sonarr episode request failed', {
        cause: episodesResponse.error,
      })
    }

    const sonarrEpisode = (episodesResponse.data ?? []).find(
      (item) => item.seasonNumber === season && item.episodeNumber === episode
    )
    if (!sonarrEpisode?.hasFile || !sonarrEpisode.episodeFileId) return

    const deleteResponse = await this.sonarr.deleteApiV3EpisodefileById({
      path: { id: sonarrEpisode.episodeFileId },
    })

    if (deleteResponse.error) {
      throw new SonarrProviderError('Sonarr episode file deletion failed', {
        cause: deleteResponse.error,
      })
    }
  }
}
