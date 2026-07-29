import LibraryItem from '#models/library_item'
import type { HttpContext } from '@adonisjs/core/http'

export default class HomeController {
  async index({ auth, inertia }: HttpContext) {
    const [moviesCount, seriesCount, recentLibraryEntries] = await Promise.all([
      LibraryItem.query().where('userId', auth.user!.id).where('type', 'movie').count('* as total'),
      LibraryItem.query().where('userId', auth.user!.id).where('type', 'serie').count('* as total'),
      LibraryItem.query().where('userId', auth.user!.id).orderBy('createdAt', 'desc').limit(3),
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
