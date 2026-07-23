import type Movie from '#models/movie'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class MovieTransformer extends BaseTransformer<Movie> {
  toObject() {
    return this.pick(this.resource, [...this.resource.$columns, 'isReleased', 'watched'])
  }
}
