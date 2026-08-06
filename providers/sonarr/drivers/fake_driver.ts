import { fakeEpisodeResource, fakeSeriesResource } from '#generated/sonarr/@faker-js/faker.gen'
import { SonarrProvider } from '#providers/sonarr/types'
import type { FakeSonarrProviderConfig } from '#providers/sonarr/types'

export default class FakeSonarrProviderDriver extends SonarrProvider {
  constructor(private config: FakeSonarrProviderConfig) {
    super()
  }

  async deleteEpisodeFileByCatalogProviderId(providerId: string, season: number, episode: number) {
    if (this.config.failDeletion) throw new Error('Fake Sonarr episode file deletion failed')

    const series = this.config.series ?? [fakeSeries()]
    const episodes = this.config.episodes ?? [fakeEpisode()]
    const serie = series.find(
      (item) => String(item.tmdbId) === providerId || `series-${item.tmdbId}` === providerId
    )
    if (!serie?.id) return

    const sonarrEpisode = episodes.find(
      (item) =>
        item.seriesId === serie.id && item.seasonNumber === season && item.episodeNumber === episode
    )
    if (!sonarrEpisode?.hasFile || !sonarrEpisode.episodeFileId) return

    this.config.deletedEpisodeFiles?.push({
      providerId,
      season,
      episode,
      episodeFileId: sonarrEpisode.episodeFileId,
    })
  }
}

function fakeSeries() {
  return { ...fakeSeriesResource(), id: 1, tmdbId: 1 }
}

function fakeEpisode() {
  return {
    ...fakeEpisodeResource(),
    seriesId: 1,
    seasonNumber: 1,
    episodeNumber: 1,
    hasFile: true,
    episodeFileId: 42,
  }
}
