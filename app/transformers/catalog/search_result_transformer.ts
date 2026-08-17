import type Movie from '#models/movie'
import type Serie from '#models/serie'
import type { CatalogSearchResult } from '#providers/catalog/types'
import { catalog } from '#services/catalog_provider'
import MovieTransformer from '#transformers/movie_transformer'
import SerieTransformer from '#transformers/serie_transformer'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class CatalogSearchResultTransformer extends BaseTransformer<CatalogSearchResult> {
  constructor(
    resource: CatalogSearchResult,
    protected libraryEntries: Map<string, Movie | Serie> = new Map()
  ) {
    super(resource)
  }

  toObject() {
    const entry = this.libraryEntries.get(`${this.resource.provider}:${this.resource.id}`)

    return {
      ...this.resource,
      bannerUrls: catalog.imageUrls('banner', this.resource.bannerPath),
      posterUrls: catalog.imageUrls('poster', this.resource.posterPath),
      inLibrary: entry
        ? this.resource.type === 'serie'
          ? SerieTransformer.transform(entry as Serie)
          : MovieTransformer.transform(entry as Movie)
        : null,
    }
  }
}
