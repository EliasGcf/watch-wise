import { type Serie } from '#providers/catalog/types'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class CatalogSerieTransformer extends BaseTransformer<Serie> {
  toObject() {
    return this.resource
  }
}
