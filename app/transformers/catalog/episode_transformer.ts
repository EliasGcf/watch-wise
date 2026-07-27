import type Serie from '#models/serie'
import { type Episode } from '#providers/catalog/types'
import { BaseTransformer } from '@adonisjs/core/transformers'
import { DateTime } from 'luxon'

export default class CatalogEpisodeTransformer extends BaseTransformer<Episode> {
  constructor(
    resource: Episode,
    protected watchedEpisodes: Serie['watchedEpisodes']
  ) {
    super(resource)
  }

  toObject() {
    const watched = this.watchedEpisodes.find(
      (mark) => mark.season === this.resource.season && mark.episode === this.resource.episode
    )

    return {
      ...this.resource,
      isReleased: DateTime.fromISO(this.resource.releasedAt) <= DateTime.now(),
      watched: watched ? { watchedAt: watched.watchedAt.toISO() } : null,
    }
  }
}
