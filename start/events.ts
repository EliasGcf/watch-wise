import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'
import { listeners } from '#generated/listeners'
const updateSeriesProgress = () => import('#listeners/update_series_progress')

emitter.on(events.MovieWatched, [listeners.UpdateUserWatchedTime])
emitter.on(events.MovieUnwatched, [listeners.UpdateUserWatchedTime])
emitter.on(events.EpisodeWatched, [listeners.UpdateUserWatchedTime])
emitter.on(events.EpisodeUnwatched, [listeners.UpdateUserWatchedTime])
emitter.on(events.EpisodeWatched, [updateSeriesProgress])
emitter.on(events.EpisodeUnwatched, [updateSeriesProgress])
