import { type events } from '#generated/events'
import User from '#models/user'
import WatchedMark from '#models/watched_mark'

type Event =
  | InstanceType<typeof events.MovieWatched>
  | InstanceType<typeof events.MovieUnwatched>
  | InstanceType<typeof events.EpisodeWatched>
  | InstanceType<typeof events.EpisodeUnwatched>
  | InstanceType<typeof events.LibraryEntryRemoved>

export default class UpdateUserWatchedTime {
  async handle(event: Event) {
    if ('entry' in event) {
      const watchedDuration = await WatchedMark.query(
        event.$trx ? { client: event.$trx } : undefined
      )
        .where('libraryEntryId', event.entry.id)
        .where('userId', event.entry.userId)
        .sum('duration as total')
        .firstOrFail()
      const duration = Number(watchedDuration.$extras.total ?? 0)

      if (duration === 0) return

      await User.query(event.$trx ? { client: event.$trx } : undefined)
        .where('id', event.entry.userId)
        .decrement('watchedTime', duration)
      return
    }

    await User.query(event.watched.$trx ? { client: event.watched.$trx } : undefined)
      .where('id', event.watched.userId)
      .increment('watchedTime', event.duration)
  }
}
