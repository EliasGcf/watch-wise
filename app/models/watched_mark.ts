import { WatchedMarkSchema } from '#database/schema'
import Movie from '#models/movie'
import User from '#models/user'
import { beforeFetch, beforeFind, belongsTo } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class WatchedMark extends WatchedMarkSchema {
  static table = 'watched_marks'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}

export class MovieWatchedMark extends WatchedMark {
  static table = 'watched_marks'

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof MovieWatchedMark>) {
    query.whereNull('season').whereNull('episode')
  }

  @belongsTo(() => Movie, { foreignKey: 'libraryEntryId' })
  declare movie: BelongsTo<typeof Movie>
}
