import CatalogProvider, { CatalogProviderError } from '#services/catalog_provider'
import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'

export default class CatalogSearchController {
  @inject()
  async index({ inertia, request }: HttpContext, catalogProvider: CatalogProvider) {
    const query = String(request.input('q', '')).trim()

    if (!query) {
      return inertia.render('catalog/search', { query, results: [], limitation: null })
    }

    try {
      const results = await catalogProvider.search(query)

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
