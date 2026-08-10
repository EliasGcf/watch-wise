import type Movie from '#models/movie'
import type Serie from '#models/serie'
import { catalog, CatalogProviderError } from '#services/catalog_provider'
import CatalogSearchResultTransformer from '#transformers/catalog/search_result_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class CatalogSearchController {
  async index({ request, auth, inertia }: HttpContext) {
    const query = String(request.input('q', '')).trim()

    try {
      const results = query ? await catalog.search(query) : await catalog.weekTrending()
      const catalogIds = results.map((result) => result.id)
      const libraryEntries = new Map<string, Movie | Serie>()

      if (results.length) {
        const [movies, series] = await Promise.all([
          auth.user!.related('movies').query().whereIn('providerId', catalogIds).preload('watched'),
          auth.user!.related('series').query().whereIn('providerId', catalogIds),
        ])

        for (const movie of movies) {
          libraryEntries.set(`${movie.provider}:${movie.providerId}`, movie)
        }

        for (const serie of series) {
          libraryEntries.set(`${serie.provider}:${serie.providerId}`, serie)
        }
      }

      return inertia.render('catalog/search', {
        query,
        limitation: null,
        results: CatalogSearchResultTransformer.transform(results, libraryEntries),
      })
    } catch (error) {
      if (!(error instanceof CatalogProviderError)) {
        throw error
      }

      return inertia.render('catalog/search', {
        query,
        results: CatalogSearchResultTransformer.transform([]),
        limitation: 'Catalog search is temporarily limited. Try again later.',
      })
    }
  }
}
