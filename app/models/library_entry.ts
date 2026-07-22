import User from '#models/user'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class LibraryEntry extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare provider: string

  @column()
  declare providerTitleId: string

  @column()
  declare titleType: 'movie' | 'series'

  @column()
  declare titleName: string

  @column()
  declare bannerUrl: string | null

  @column()
  declare releaseYear: number | null

  @column()
  declare summary: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
