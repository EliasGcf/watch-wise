import { WatchedMovie } from '#models/watched_mark'
import User from '#models/user'
import { beforeCreate, beforeFetch, beforeFind, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import LibraryItem from '#models/library_item'

export default class Movie extends LibraryItem {
  static table = LibraryItem.table

  declare type: 'movie'
  declare progress: null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasOne(() => WatchedMovie, { foreignKey: 'libraryEntryId' })
  declare watched: HasOne<typeof WatchedMovie>

  async watch(this: Movie, duration: number | null) {
    await this.related('watched').firstOrCreate(
      { userId: this.userId },
      { providerId: this.providerId, duration, watchedAt: DateTime.now() }
    )
  }

  async unwatch(this: Movie) {
    await this.watched.delete()
  }

  @beforeCreate()
  static assignType(movie: Movie) {
    movie.type = 'movie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Movie>) {
    query.where('type', 'movie').preload('watched').orderBy('createdAt', 'desc')
  }
}
