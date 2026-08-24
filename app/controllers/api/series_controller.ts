import { loadSeriesListing } from '#services/library_listing'
import SerieTransformer from '#transformers/serie_transformer'
import { libraryQueryValidator } from '#validators/library'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async index({ auth, request, serialize }: HttpContext) {
    const { q } = await request.validateUsing(libraryQueryValidator)
    const { query, loadedAt, series } = await loadSeriesListing(auth.user!, q ?? '')

    return serialize({ query, loadedAt, series: SerieTransformer.transform(series) })
  }
}
