import { type WatchedEpisode } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class EpisodeWatched extends BaseEvent {
  constructor(public watchedEpisode: WatchedEpisode) {
    super()
  }
}
