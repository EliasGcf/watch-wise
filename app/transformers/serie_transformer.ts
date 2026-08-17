import type Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import { calculateSerieProgress } from '#services/series_progress'
import CatalogSerieTransformer from '#transformers/catalog/serie_transformer'
import WatchedEpisodeTransformer from '#transformers/watched_episode_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class SerieTransformer extends BaseTransformer<Serie> {
  async toObject() {
    const catalogSerie = await catalog.findSerieById(this.resource.providerId)

    if (!catalogSerie) {
      throw new Error(`Serie with providerId "${this.resource.providerId}" not found in catalog.`)
    }

    const progress = await calculateSerieProgress(this.resource, catalogSerie)

    return {
      ...this.pick(this.resource, [...this.resource.$columns, 'bannerUrls', 'posterUrls']),
      progress,
      inProduction: catalogSerie?.inProduction ?? true,
      watchedEpisodes: WatchedEpisodeTransformer.transform(
        this.whenLoaded(this.resource.watchedEpisodes)
      ),
    }
  }

  async withCatalog() {
    const catalogSerie = await catalog.findSerieById(this.resource.providerId)

    if (!catalogSerie) {
      throw new Error(`Serie with providerId "${this.resource.providerId}" not found in catalog.`)
    }

    return {
      ...(await this.toObject()),
      catalog: CatalogSerieTransformer.transform(catalogSerie),
    }
  }
}
