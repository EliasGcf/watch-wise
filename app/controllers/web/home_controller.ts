import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ auth, inertia }: HttpContext) {
    const user = auth.user!

    const [moviesCount, seriesCount, recentLibraryEntries] = await Promise.all([
      user.related('movies').query().count('* as total'),
      user.related('series').query().count('* as total'),
      user.related('libraryEntries').query().orderBy('createdAt', 'desc').limit(3),
    ])

    return inertia.render('home', {
      moviesCount: Number(moviesCount[0].$extras.total),
      seriesCount: Number(seriesCount[0].$extras.total),
      recentLibraryEntries: recentLibraryEntries.map((entry) => ({
        id: entry.id,
        name: entry.name,
        type: entry.type as 'movie' | 'serie',
        summary: entry.summary,
      })),
    })
  }
}
