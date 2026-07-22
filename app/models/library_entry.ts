import { LibraryEntrySchema } from '#database/schema'
import User from '#models/user'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class LibraryEntry extends LibraryEntrySchema {
  declare type: 'movie' | 'series'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
