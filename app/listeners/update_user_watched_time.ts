import { type events } from '#generated/events'
import User from '#models/user'

type Event =
  | InstanceType<typeof events.MovieWatched>
  | InstanceType<typeof events.MovieUnwatched>
  | InstanceType<typeof events.EpisodeWatched>
  | InstanceType<typeof events.EpisodeUnwatched>
  | InstanceType<typeof events.LibraryEntryRemoved>

export default class UpdateUserWatchedTime {
  async handle(event: Event) {
    await User.query(event.$trx ? { client: event.$trx } : undefined)
      .where('id', event.userId)
      .increment('watchedTime', await event.duration())
  }
}
