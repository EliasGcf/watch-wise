import { type WatchedMovie } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class MovieUnwatched extends BaseEvent {
  readonly action = 'decrement'

  get duration() {
    return -this.watched.duration
  }

  constructor(public watched: WatchedMovie) {
    super()
  }
}
