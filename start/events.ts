import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'
import { listeners } from '#generated/listeners'

emitter.listen(events.MovieWatched, [listeners.UpdateUserWatchedTime])

emitter.listen(events.MovieUnwatched, [listeners.UpdateUserWatchedTime])

emitter.listen(events.EpisodeWatched, [
  listeners.UpdateUserWatchedTime,
  listeners.UpdateSeriesProgress,
])

emitter.listen(events.EpisodeUnwatched, [
  listeners.UpdateUserWatchedTime,
  listeners.UpdateSeriesProgress,
])
