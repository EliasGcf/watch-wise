import type Show from '#models/show'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class ShowTransformer extends BaseTransformer<Show> {
  toObject() {
    return {
      ...this.pick(this.resource, [
        'id',
        'provider',
        'providerId',
        'type',
        'name',
        'bannerUrl',
        'summary',
      ]),
      releaseDate: this.resource.releaseDate?.toISODate() ?? null,
    }
  }
}
