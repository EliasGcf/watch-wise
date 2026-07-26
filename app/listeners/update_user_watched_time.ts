import { events } from '#generated/events'
import User from '#models/user'

type WatchedTimeEvent =
  | InstanceType<typeof events.MovieWatched>
  | InstanceType<typeof events.MovieUnwatched>
  | InstanceType<typeof events.EpisodeWatched>
  | InstanceType<typeof events.EpisodeUnwatched>

export default class UpdateUserWatchedTime {
  async handle(event: WatchedTimeEvent) {
    const watchedMark =
      'watchedMovie' in event
        ? event.watchedMovie
        : 'watchedEpisode' in event
          ? event.watchedEpisode
          : null

    if (!watchedMark || watchedMark.duration === null) return

    const amount =
      event instanceof events.MovieUnwatched || event instanceof events.EpisodeUnwatched
        ? -watchedMark.duration
        : watchedMark.duration

    await User.query(watchedMark.$trx ? { client: watchedMark.$trx } : undefined)
      .where('id', watchedMark.userId)
      .increment('watchedTime', amount)
  }
}
