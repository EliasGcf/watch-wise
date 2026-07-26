import { type WatchedEpisode } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class EpisodeWatched extends BaseEvent {
  readonly action = 'increment'

  get duration() {
    return this.watched.duration
  }

  constructor(public watched: WatchedEpisode) {
    super()
  }
}
