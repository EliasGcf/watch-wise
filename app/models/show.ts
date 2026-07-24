import { LibraryEntrySchema } from '#database/schema'
import User from '#models/user'
import { catalog } from '#services/catalog_provider'
import { beforeCreate, beforeFetch, beforeFind, belongsTo, computed } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Show extends LibraryEntrySchema {
  static table = 'library_entries'

  declare type: 'serie'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignType(show: Show) {
    show.type = 'serie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Show>) {
    query.where('type', 'serie')
  }

  @computed()
  get bannerUrl() {
    const url = new URL(this.bannerPath, catalog.config('tmdb').baseImageUrl)
    return url.toString()
  }

  @computed()
  get posterUrl() {
    const url = new URL(this.posterPath, catalog.config('tmdb').baseImageUrl)
    return url.toString()
  }
}
