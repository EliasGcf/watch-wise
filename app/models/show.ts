import { LibraryEntrySchema } from '#database/schema'
import User from '#models/user'
import { beforeCreate, beforeFetch, beforeFind, belongsTo } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Show extends LibraryEntrySchema {
  static table = 'library_entries'

  declare type: 'series'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignType(show: Show) {
    show.type = 'series'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Show>) {
    query.where('type', 'series')
  }
}
