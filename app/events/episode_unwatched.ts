import { type WatchedEpisode } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class EpisodeUnwatched extends BaseEvent {
  readonly action = 'decrement'

  get duration() {
    return -this.watched.duration
  }

  constructor(public watched: WatchedEpisode) {
    super()
  }
}
