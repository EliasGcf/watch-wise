import type Movie from '#models/movie'
import type Serie from '#models/serie'
import { pagination } from '#config/pagination'
import { catalog, CatalogProviderError } from '#services/catalog_provider'
import CatalogSearchResultTransformer from '#transformers/catalog/search_result_transformer'
import { indexCatalogSearchValidator } from '#validators/catalog_search'
import type { HttpContext } from '@adonisjs/core/http'

export default class CatalogSearchController {
  async index({ request, auth, inertia }: HttpContext) {
    const {
      q: query = '',
      page = 1,
      type = 'all',
    } = await request.validateUsing(indexCatalogSearchValidator)

    try {
      const searchPage = query
        ? await catalog.search(query, type, page)
        : await catalog.weekTrending(type, page)
      const results = searchPage.data
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
        type,
        limitation: null,
        results: inertia
          .scroll(
            CatalogSearchResultTransformer.paginate(
              results,
              {
                currentPage: searchPage.currentPage,
                lastPage: searchPage.lastPage,
                perPage: pagination.perPage,
                total: searchPage.total,
              },
              libraryEntries
            )
          )
          .matchOn('id'),
      })
    } catch (error) {
      if (!(error instanceof CatalogProviderError)) {
        throw error
      }

      return inertia.render('catalog/search', {
        query,
        type,
        results: inertia
          .scroll(
            CatalogSearchResultTransformer.paginate([], {
              currentPage: page,
              lastPage: page,
              perPage: pagination.perPage,
              total: 0,
            }),
            () => ({
              pageName: 'page',
              currentPage: page,
              nextPage: null,
              previousPage: page > 1 ? page - 1 : null,
            })
          )
          .matchOn('id'),
        limitation: 'Catalog search is temporarily limited. Try again later.',
      })
    }
  }
}
