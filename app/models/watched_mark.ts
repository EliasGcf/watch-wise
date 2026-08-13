import { WatchedMarkSchema } from '#database/schema'
import { events } from '#generated/events'
import LibraryItem from '#models/library_item'
import Movie from '#models/movie'
import Serie from '#models/serie'
import User from '#models/user'
import {
  afterCreate,
  afterDelete,
  beforeCreate,
  beforeFetch,
  beforeFind,
  belongsTo,
} from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class WatchedMark extends WatchedMarkSchema {
  static table = 'watched_marks'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => LibraryItem, { foreignKey: 'libraryEntryId' })
  declare libraryEntry: BelongsTo<typeof LibraryItem>
}

export class WatchedMovie extends WatchedMark {
  static table = WatchedMark.table

  declare type: 'movie'

  @belongsTo(() => Movie, { foreignKey: 'libraryEntryId' })
  declare movie: BelongsTo<typeof Movie>

  @beforeCreate()
  static assignType(movie: WatchedMovie) {
    movie.type = 'movie'
  }

  @afterCreate()
  static async dispatchWatchedEvent(movie: WatchedMovie) {
    await events.MovieWatched.dispatch({
      watched: movie,
      deleteFile: Boolean(movie.$extras.deleteFile),
    })
  }

  @afterDelete()
  static async dispatchUnwatchedEvent(movie: WatchedMovie) {
    await events.MovieUnwatched.dispatch(movie)
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof WatchedMovie>) {
    query.where('type', 'movie')
  }
}

export class WatchedEpisode extends WatchedMark {
  static table = WatchedMark.table

  declare type: 'episode'

  declare season: number
  declare episode: number

  @belongsTo(() => Serie, { foreignKey: 'libraryEntryId' })
  declare serie: BelongsTo<typeof Serie>

  @beforeCreate()
  static assignType(episode: WatchedEpisode) {
    episode.type = 'episode'
  }

  @afterCreate()
  static async dispatchWatchedEvent(episode: WatchedEpisode) {
    await events.EpisodeWatched.dispatch({
      watched: episode,
      deleteFile: Boolean(episode.$extras.deleteFile),
    })
  }

  @afterDelete()
  static async dispatchUnwatchedEvent(episode: WatchedEpisode) {
    await events.EpisodeUnwatched.dispatch(episode)
  }

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof WatchedEpisode>) {
    query.where('type', 'episode')
  }
}
