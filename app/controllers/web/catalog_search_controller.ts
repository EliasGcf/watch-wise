import { catalog, CatalogProviderError } from '#services/catalog_provider'
import CatalogSearchResultTransformer from '#transformers/catalog/search_result_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class CatalogSearchController {
  async index({ inertia, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()

    try {
      const results = query ? await catalog.search(query) : await catalog.weekTrending()

      return inertia.render('catalog/search', {
        query,
        limitation: null,
        results: CatalogSearchResultTransformer.transform(results),
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
