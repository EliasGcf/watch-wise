import type Show from '#models/show'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ShowTransformer extends BaseTransformer<Show> {
  toObject() {
    return this.pick(this.resource, [...this.resource.$columns, 'bannerUrl', 'posterUrl'])
  }
}
