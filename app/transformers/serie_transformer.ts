import type Serie from '#models/serie'
import { WatchedEpisode } from '#models/watched_mark'
import type { Serie as CatalogSerie } from '#providers/catalog/types'
import { catalog } from '#services/catalog_provider'
import { calculateSerieProgress } from '#services/series_progress'
import CatalogSerieTransformer from '#transformers/catalog/serie_transformer'
import WatchedEpisodeTransformer from '#transformers/watched_episode_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class SerieTransformer extends BaseTransformer<Serie> {
  #catalogSerie?: Promise<CatalogSerie>

  constructor(
    resource: Serie,
    protected catalogSeries: Map<number, CatalogSerie> = new Map()
  ) {
    super(resource)
  }

  async #getCatalogSerie() {
    return (this.#catalogSerie ??= (async () => {
      const catalogSerie =
        this.catalogSeries.get(this.resource.id) ??
        (await catalog.findSerieById(this.resource.providerId))

      if (!catalogSerie) {
        throw new Error(`Serie with providerId "${this.resource.providerId}" not found in catalog.`)
      }

      return catalogSerie
    })())
  }

  async #watchedRegularEpisodesCount() {
    const count = this.resource.$extras.watchedEpisodes_count
    if (count !== undefined) return Number(count)

    if (this.resource.$preloaded.watchedEpisodes) {
      return this.resource.watchedEpisodes.filter((episode) => episode.season !== 0).length
    }

    const watchedEpisodesCount = await WatchedEpisode.query()
      .where('userId', this.resource.userId)
      .where('libraryEntryId', this.resource.id)
      .whereNot('season', 0)
      .count('* as total')
      .firstOrFail()

    return Number(watchedEpisodesCount.$extras.total)
  }

  async toObject() {
    const [catalogSerie, watched] = await Promise.all([
      this.#getCatalogSerie(),
      this.#watchedRegularEpisodesCount(),
    ])

    return {
      ...this.pick(this.resource, [...this.resource.$columns, 'bannerUrls', 'posterUrls']),
      progress: calculateSerieProgress(watched, catalogSerie.releasedEpisodesCount),
      inProduction: catalogSerie?.inProduction ?? true,
      watchedEpisodes: WatchedEpisodeTransformer.transform(
        this.whenLoaded(this.resource.watchedEpisodes)
      ),
    }
  }

  async withCatalog() {
    const catalogSerie = await this.#getCatalogSerie()

    return {
      ...(await this.toObject()),
      catalog: CatalogSerieTransformer.transform(catalogSerie),
    }
  }
}
