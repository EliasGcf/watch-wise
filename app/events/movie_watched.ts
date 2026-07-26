import { type WatchedMovie } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class MovieWatched extends BaseEvent {
  constructor(public watchedMovie: WatchedMovie) {
    super()
  }
}
