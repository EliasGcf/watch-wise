import { type CatalogSearchResult } from '#providers/catalog/types'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class CatalogSearchResultTransformer extends BaseTransformer<CatalogSearchResult> {
  toObject() {
    return this.resource
  }
}
