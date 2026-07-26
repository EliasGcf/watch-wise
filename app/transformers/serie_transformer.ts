import type Serie from '#models/serie'
import { type CatalogEpisode } from '#providers/catalog_provider/types'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { DateTime } from 'luxon'

export default class SerieTransformer extends BaseTransformer<Serie> {
  constructor(
    resource: Serie,
    protected episodes: CatalogEpisode[] = []
  ) {
    super(resource)
  }

  toObject() {
    return this.pick(this.resource, [...this.resource.$columns, 'bannerUrl', 'posterUrl'])
  }

  withSeasons() {
    return {
      ...this.toObject(),
      seasons: this.resource.seasons ?? [],
    }
  }

  forEpisodes() {
    return {
      episodes: this.episodes.map((episode) => {
        const watched = this.resource.watchedEpisodes.find(
          (mark) => mark.season === episode.season && mark.episode === episode.episode
        )

        return {
          providerId: episode.providerId,
          season: episode.season,
          episode: episode.episode,
          name: episode.name,
          releasedAt: episode.releasedAt,
          duration: episode.duration,
          summary: episode.summary,
          isReleased: DateTime.fromISO(episode.releasedAt) <= DateTime.now(),
          isSpecial: episode.isSpecial,
          watched: watched ? { watchedAt: watched.watchedAt.toISO() } : null,
        }
      }),
    }
  }
}
