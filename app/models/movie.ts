import { LibraryEntrySchema } from '#database/schema'
import User from '#models/user'
import { beforeCreate, beforeFetch, beforeFind, belongsTo } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Movie extends LibraryEntrySchema {
  static table = 'library_entries'

  declare type: 'movie'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignType(movie: Movie) {
    movie.type = 'movie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Movie>) {
    query.where('type', 'movie')
  }
}
