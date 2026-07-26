import { type WatchedMovie } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class MovieWatched extends BaseEvent {
  readonly action = 'increment'

  get duration() {
    return this.watched.duration
  }

  constructor(public watched: WatchedMovie) {
    super()
  }
}
