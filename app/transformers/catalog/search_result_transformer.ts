import { type CatalogSearchResult } from '#providers/catalog/types'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class CatalogSearchResultTransformer extends BaseTransformer<CatalogSearchResult> {
  constructor(
    resource: CatalogSearchResult,
    protected inLibrary: Set<string> = new Set()
  ) {
    super(resource)
  }

  toObject() {
    return {
      ...this.resource,
      inLibrary: this.inLibrary.has(`${this.resource.provider}:${this.resource.id}`),
    }
  }
}
