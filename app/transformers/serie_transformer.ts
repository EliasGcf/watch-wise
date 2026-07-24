import type Serie from '#models/serie'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class SerieTransformer extends BaseTransformer<Serie> {
  toObject() {
    return this.pick(this.resource, [...this.resource.$columns, 'bannerUrl', 'posterUrl'])
  }
}
