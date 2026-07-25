import LibraryItem from '#models/library_item'
import User from '#models/user'
import { EpisodeWatchedMark } from '#models/watched_mark'
import type { CatalogEpisode, CatalogSeason } from '#providers/catalog_provider/types'
import { beforeCreate, beforeFetch, beforeFind, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Serie extends LibraryItem {
  static table = LibraryItem.table

  declare type: 'serie'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => EpisodeWatchedMark, { foreignKey: 'libraryEntryId' })
  declare watchedEpisodes: HasMany<typeof EpisodeWatchedMark>

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
        season: episode.season,
        episode: episode.episode,
      },
      {
        userId: this.userId,
        libraryEntryId: this.id,
        season: episode.season,
        episode: episode.episode,
        name: episode.name,
        releasedAt: DateTime.fromISO(episode.releasedAt),
        providerId: episode.providerId,
        duration: episode.duration,
        watchedAt: DateTime.now(),
      }
    )
  }

  async unwatchEpisode(season: number, episode: number) {
    await EpisodeWatchedMark.query()
      .where('userId', this.userId)
      .where('libraryEntryId', this.id)
      .where('season', season)
      .where('episode', episode)
      .delete()
  }

  declare seasons?: CatalogSeason[]
}
