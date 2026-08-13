import emitter from '@adonisjs/core/services/emitter'
import { events } from '#generated/events'
import { listeners } from '#generated/listeners'

emitter.listen(events.MovieWatched, [
  listeners.UpdateUserWatchedTime,
  listeners.DeleteRadarrMovieFile,
])

emitter.listen(events.MovieUnwatched, [listeners.UpdateUserWatchedTime])

emitter.listen(events.EpisodeWatched, [
  listeners.UpdateUserWatchedTime,
  listeners.DeleteSonarrEpisodeFile,
])

emitter.listen(events.EpisodeUnwatched, [listeners.UpdateUserWatchedTime])

emitter.listen(events.LibraryEntryRemoved, [listeners.UpdateUserWatchedTime])
