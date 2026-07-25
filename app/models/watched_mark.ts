import { WatchedMarkSchema } from '#database/schema'
import { beforeFetch, beforeFind } from '@adonisjs/lucid/orm'
import type { ModelQueryBuilderContract } from '@adonisjs/lucid/types/model'

export default class WatchedMark extends WatchedMarkSchema {
  static table = 'watched_marks'
}

export class MovieWatchedMark extends WatchedMark {
  static table = 'watched_marks'

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof MovieWatchedMark>) {
    query.whereNull('season').whereNull('episode')
  }
}

export class EpisodeWatchedMark extends WatchedMark {
  static table = 'watched_marks'

  @beforeFind()
  @beforeFetch()
  static filterType(query: ModelQueryBuilderContract<typeof EpisodeWatchedMark>) {
    query.whereNotNull('season').whereNotNull('episode')
  }
}
