import LibraryItem from '#models/library_item'
import { EpisodeWatchedMark } from '#models/watched_mark'
import type { CatalogEpisode } from '#providers/catalog_provider/types'
import { beforeCreate, beforeFetch, beforeFind } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export default class Serie extends LibraryItem {
  static table = LibraryItem.table

  declare type: 'serie'

  @beforeCreate()
  static assignType(serie: Serie) {
    serie.type = 'serie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Serie>) {
    query.where('type', 'serie')
  }

  async watchEpisode(episode: CatalogEpisode) {
    await EpisodeWatchedMark.firstOrCreate(
      {
        userId: this.userId,
        libraryEntryId: this.id,
        season: episode.seasonNumber,
        episode: episode.episodeNumber,
      },
      {
        userId: this.userId,
        libraryEntryId: this.id,
        season: episode.seasonNumber,
        episode: episode.episodeNumber,
        name: episode.name,
        releasedAt: DateTime.fromISO(episode.releasedAt),
        providerId: episode.providerId,
        duration: episode.runtime,
        watchedAt: DateTime.now(),
      }
    )
  }

  async unwatchEpisode(seasonNumber: number, episodeNumber: number) {
    await EpisodeWatchedMark.query()
      .where('userId', this.userId)
      .where('libraryEntryId', this.id)
      .where('season', seasonNumber)
      .where('episode', episodeNumber)
      .delete()
  }
}
