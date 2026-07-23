import { LibraryEntrySchema } from '#database/schema'
import { MovieWatchedMark } from '#models/watched_mark'
import User from '#models/user'
import { beforeCreate, beforeFetch, beforeFind, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class Movie extends LibraryEntrySchema {
  static table = 'library_entries'

  declare type: 'movie'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasOne(() => MovieWatchedMark, { foreignKey: 'libraryEntryId' })
  declare watched: HasOne<typeof MovieWatchedMark>

  @beforeCreate()
  static assignType(movie: Movie) {
    movie.type = 'movie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Movie>) {
    query.where('type', 'movie').preload('watched')
  }

  get isReleased() {
    return Boolean(this.releaseDate && this.releaseDate <= DateTime.now())
  }

  async watch(duration: number | null = null) {
    await MovieWatchedMark.firstOrCreate(
      { userId: this.userId, libraryEntryId: this.id, season: null, episode: null },
      { duration, watchedAt: DateTime.now() }
    )
  }

  async unwatch(this: Movie) {
    await this.watched.delete()
  }
}
