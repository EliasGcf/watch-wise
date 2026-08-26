import { WatchedMovie } from '#models/watched_mark'
import User from '#models/user'
import {
  beforeCreate,
  beforeFetch,
  beforeFind,
  beforePaginate,
  belongsTo,
  hasOne,
} from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import LibraryItem from '#models/library_item'

export default class Movie extends LibraryItem {
  static table = LibraryItem.table

  declare type: 'movie'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasOne(() => WatchedMovie, { foreignKey: 'libraryEntryId' })
  declare watched: HasOne<typeof WatchedMovie>

  async watch(this: Movie, duration: number | null, deleteFile = false) {
    const watched = await this.related('watched').query().first()
    if (watched) return

    const created = new WatchedMovie()

    created.userId = this.userId
    created.providerId = this.providerId
    created.duration = duration
    created.watchedAt = DateTime.now()
    created.$extras.deleteFile = deleteFile
    created.$trx = this.$trx

    await this.related('watched').save(created)
  }

  async unwatch(this: Movie) {
    const watched = await this.related('watched').query().first()
    await watched?.delete()
  }

  @beforeCreate()
  static assignType(movie: Movie) {
    movie.type = 'movie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Movie>) {
    query.where('type', 'movie').orderBy('createdAt', 'desc')
  }

  @beforePaginate()
  static filterPaginatedType([countQuery]: [
    ModelQueryBuilderContract<typeof Movie>,
    ModelQueryBuilderContract<typeof Movie>,
  ]) {
    countQuery.where('type', 'movie')
  }
}
