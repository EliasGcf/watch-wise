import LibraryItem from '#models/library_item'
import { beforeCreate, beforeFetch, beforeFind } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class Serie extends LibraryItem {
  static table = LibraryItem.table

  declare type: 'serie'

  @beforeCreate()
  static assignType(serie: Serie) {
    serie.type = 'serie'
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof Serie>) {
    query.where('type', 'serie')
  }
}
