import { type events } from '#generated/events'
import User from '#models/user'

type Event =
  | InstanceType<typeof events.MovieWatched>
  | InstanceType<typeof events.MovieUnwatched>
  | InstanceType<typeof events.EpisodeWatched>
  | InstanceType<typeof events.EpisodeUnwatched>

export default class UpdateUserWatchedTime {
  async handle(event: Event) {
    await User.query(event.watched.$trx ? { client: event.watched.$trx } : undefined)
      .where('id', event.watched.userId)
      .increment('watchedTime', event.duration)
  }
}
