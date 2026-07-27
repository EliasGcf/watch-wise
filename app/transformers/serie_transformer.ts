import type Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'
import CatalogSerieTransformer from '#transformers/catalog/serie_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class SerieTransformer extends BaseTransformer<Serie> {
  toObject() {
    return {
      ...this.pick(this.resource, [...this.resource.$columns, 'bannerUrl', 'posterUrl']),
      episodesCount: Number(this.resource.$extras.episodesCount ?? 0),
      watchedEpisodesCount: Number(this.resource.$extras.watchedEpisodesCount ?? 0),
    }
  }

  async withCatalog() {
    const catalogSerie = await catalog.findSerieById(this.resource.providerId)

    if (!catalogSerie) {
      throw new Error(`Serie with providerId "${this.resource.providerId}" not found in catalog.`)
    }

    return {
      ...this.toObject(),
      episodesCount: catalogSerie.episodesCount,
      watchedEpisodesCount: this.resource.watchedEpisodes?.length ?? 0,
      catalog: CatalogSerieTransformer.transform(catalogSerie),
    }
  }
}
