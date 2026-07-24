import { catalog, CatalogProviderError } from '#services/catalog_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class CatalogSearchController {
  async index({ inertia, request }: HttpContext) {
    const query = String(request.input('q', '')).trim()

    if (!query) {
      return inertia.render('catalog/search', { query, results: [], limitation: null })
    }

    try {
      const results = await catalog.search(query)

      return inertia.render('catalog/search', {
        query,
        limitation: null,
        results,
      })
    } catch (error) {
      if (!(error instanceof CatalogProviderError)) {
        throw error
      }

      return inertia.render('catalog/search', {
        query,
        results: [],
        limitation: 'Catalog search is temporarily limited. Try again later.',
      })
    }
  }
}
