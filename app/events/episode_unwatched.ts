import { type WatchedEpisode } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class EpisodeUnwatched extends BaseEvent {
  constructor(public watchedEpisode: WatchedEpisode) {
    super()
  }
}
