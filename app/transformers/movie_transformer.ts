import type Movie from '#models/movie'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class MovieTransformer extends BaseTransformer<Movie> {
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
      watched: Boolean(this.resource.watched),
    }
  }
}
