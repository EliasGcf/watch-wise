import LibraryItem from '#models/library_item'
import User from '#models/user'
import { WatchedEpisode } from '#models/watched_mark'
import type { Episode } from '#providers/catalog/types'
import {
  beforeCreate,
  beforeFetch,
  beforeFind,
  beforePaginate,
  belongsTo,
  hasMany,
} from '@adonisjs/lucid/orm'
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

  async watchEpisode(this: Serie, episode: Episode, deleteFile = false) {
    const watched = await this.related('watchedEpisodes')
      .query()
      .where('userId', this.userId)
      .where('season', episode.season)
      .where('episode', episode.episode)
      .first()

    if (watched) return watched

    const created = new WatchedEpisode()
    created.libraryEntryId = this.id
    created.userId = this.userId
    created.season = episode.season
    created.episode = episode.episode
    created.providerId = episode.providerId
    created.duration = episode.duration
    created.watchedAt = DateTime.now()
    created.$extras.deleteFile = deleteFile
    created.$trx = this.$trx

    await created.save()

    return created
  }

  async watchEpisodes(this: Serie, episodes: Episode[], deleteFile = false) {
    if (episodes.length === 0) return

    const watchedAt = DateTime.now()
    const watchedEpisodes = await this.related('watchedEpisodes')
      .query()
      .where('userId', this.userId)
      .whereIn(
        ['season', 'episode'],
        episodes.map((episode) => [episode.season, episode.episode])
      )
    const missingEpisodes = episodes.filter(
      (episode) =>
        !watchedEpisodes.some(
          (watched) => watched.season === episode.season && watched.episode === episode.episode
        )
    )

    if (missingEpisodes.length === 0) return

    const toSave = missingEpisodes.map((episode) => {
      const watched = new WatchedEpisode()
      watched.userId = this.userId
      watched.season = episode.season
      watched.episode = episode.episode
      watched.providerId = episode.providerId
      watched.duration = episode.duration
      watched.watchedAt = watchedAt
      watched.$extras.deleteFile = deleteFile
      watched.$trx = this.$trx
      return watched
    })

    await this.related('watchedEpisodes').saveMany(toSave)
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
  static beforeCreate(serie: Serie) {
    serie.type = 'serie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Serie>) {
    query.where('type', 'serie').orderBy('createdAt', 'desc')
  }

  @beforePaginate()
  static filterPaginatedType([countQuery]: [
    ModelQueryBuilderContract<typeof Serie>,
    ModelQueryBuilderContract<typeof Serie>,
  ]) {
    countQuery.where('type', 'serie')
  }
}
