import { LibraryEntrySchema } from '#database/schema'
import User from '#models/user'
import { catalog } from '#services/catalog_provider'
import { belongsTo, computed } from '@adonisjs/lucid/orm'
import { type BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class LibraryItem extends LibraryEntrySchema {
  static table = 'library_entries'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @computed()
  get isReleased() {
    return Boolean(this.releasedAt && this.releasedAt <= DateTime.now())
  }

  @computed()
  get bannerUrl() {
    return new URL(this.bannerPath, catalog.config('tmdb').baseImageUrl).toString()
  }

  @computed()
  get posterUrl() {
    return new URL(this.posterPath, catalog.config('tmdb').baseImageUrl).toString()
  }
}
