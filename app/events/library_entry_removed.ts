import type LibraryItem from '#models/library_item'
import WatchedMark from '#models/watched_mark'
import { BaseEvent } from '@adonisjs/core/events'

export default class LibraryEntryRemoved extends BaseEvent {
  get userId() {
    return this.entry.userId
  }

  get $trx() {
    return this.entry.$trx
  }

  constructor(public entry: LibraryItem) {
    super()
  }

  async duration() {
    const watchedDuration = await WatchedMark.query(this.$trx ? { client: this.$trx } : undefined)
      .where('libraryEntryId', this.entry.id)
      .where('userId', this.entry.userId)
      .sum('duration as total')
      .firstOrFail()

    const duration = Number(watchedDuration.$extras.total ?? 0)

    return -duration
  }
}
