import Serie from '#models/serie'
import type { HttpContext } from '@adonisjs/core/http'

export default class SeriesController {
  async show({ auth, inertia, params }: HttpContext) {
    const serie = await Serie.findByOrFail({ id: params.id, userId: auth.user!.id })

    return inertia.render('library/series/show', {
      serie: {
        id: serie.id,
        name: serie.name,
        summary: serie.summary,
        bannerUrl: serie.bannerUrl,
        posterUrl: serie.posterUrl,
        provider: serie.provider,
        providerId: serie.providerId,
      },
    })
  }
}
