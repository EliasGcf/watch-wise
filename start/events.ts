import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'
import { listeners } from '#generated/listeners'

emitter.on(events.MovieWatched, [listeners.UpdateUserWatchedTime])
emitter.on(events.MovieUnwatched, [listeners.UpdateUserWatchedTime])
emitter.on(events.EpisodeWatched, [listeners.UpdateUserWatchedTime])
emitter.on(events.EpisodeUnwatched, [listeners.UpdateUserWatchedTime])
