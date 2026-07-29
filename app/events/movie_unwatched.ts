import { type WatchedMovie } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class MovieUnwatched extends BaseEvent {
  get userId() {
    return this.watched.userId
  }

  get $trx() {
    return this.watched.$trx
  }

  duration() {
    return -(this.watched.duration ?? 0)
  }

  constructor(public watched: WatchedMovie) {
    super()
  }
}
