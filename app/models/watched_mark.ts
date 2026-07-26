import { WatchedMarkSchema } from '#database/schema'
import LibraryItem from '#models/library_item'
import Movie from '#models/movie'
import Serie from '#models/serie'
import User from '#models/user'
import { beforeCreate, beforeFetch, beforeFind, belongsTo } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class WatchedMark extends WatchedMarkSchema {
  static table = 'watched_marks'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => LibraryItem, { foreignKey: 'libraryEntryId' })
  declare libraryEntry: BelongsTo<typeof LibraryItem>
}

export class WatchedMovie extends WatchedMark {
  static table = WatchedMark.table

  declare type: 'movie'

  @belongsTo(() => Movie, { foreignKey: 'libraryEntryId' })
  declare movie: BelongsTo<typeof Movie>

  @beforeCreate()
  static assignType(movie: WatchedMovie) {
    movie.type = 'movie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof WatchedMovie>) {
    query.where('type', 'movie')
  }
}

export class WatchedEpisode extends WatchedMark {
  static table = WatchedMark.table

  declare type: 'episode'

  @belongsTo(() => Serie, { foreignKey: 'libraryEntryId' })
  declare serie: BelongsTo<typeof Serie>

  @beforeCreate()
  static assignType(episode: WatchedEpisode) {
    episode.type = 'episode'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof WatchedEpisode>) {
    query.where('type', 'episode')
  }
}
