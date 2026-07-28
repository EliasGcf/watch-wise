import { type WatchedEpisode } from '#models/watched_mark'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class WatchedEpisodeTransformer extends BaseTransformer<WatchedEpisode> {
  toObject() {
    return this.pick(this.resource, [...this.resource.$columns])
  }
}
