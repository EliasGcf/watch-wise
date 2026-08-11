import { type WatchedEpisode } from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class EpisodeWatched extends BaseEvent {
  get userId() {
    return this.data.watched.userId
  }

  get $trx() {
    return this.data.watched.$trx
  }

  get deleteFile() {
    return this.data.deleteFile ?? false
  }

  get watched() {
    return this.data.watched
  }

  duration() {
    return this.data.watched.duration ?? 0
  }

  constructor(public data: { watched: WatchedEpisode; deleteFile?: boolean }) {
    super()
  }
}
