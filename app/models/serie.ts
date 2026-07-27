import LibraryItem from '#models/library_item'
import User from '#models/user'
import { WatchedEpisode } from '#models/watched_mark'
import type { Episode } from '#providers/catalog/types'
import { beforeCreate, beforeFetch, beforeFind, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Serie extends LibraryItem {
  static table = LibraryItem.table

  declare type: 'serie'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasMany(() => WatchedEpisode, { foreignKey: 'libraryEntryId' })
  declare watchedEpisodes: HasMany<typeof WatchedEpisode>

  async watchEpisode(this: Serie, episode: Episode) {
    await this.related('watchedEpisodes').firstOrCreate(
      {
        userId: this.userId,
        season: episode.season,
        episode: episode.episode,
      },
      {
        userId: this.userId,
        season: episode.season,
        episode: episode.episode,
        providerId: episode.providerId,
        duration: episode.duration,
        watchedAt: DateTime.now(),
      }
    )
  }

  async unwatchEpisode(this: Serie, season: number, episode: number) {
    const watchedEpisode = await this.related('watchedEpisodes')
      .query()
      .where('userId', this.userId)
      .where('season', season)
      .where('episode', episode)
      .first()

    await watchedEpisode?.delete()
  }

  @beforeCreate()
  static assignType(serie: Serie) {
    serie.type = 'serie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Serie>) {
    query.where('type', 'serie')
  }
}
