import type Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import CatalogSerieTransformer from '#transformers/catalog/serie_transformer'
import WatchedEpisodeTransformer from '#transformers/watched_episode_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class SerieTransformer extends BaseTransformer<Serie> {
  toObject() {
    return {
      ...this.pick(this.resource, [...this.resource.$columns, 'bannerUrl', 'posterUrl']),
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
      ...this.toObject(),
      catalog: CatalogSerieTransformer.transform(catalogSerie),
    }
  }
}
