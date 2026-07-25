import Movie from '#models/movie'
import { catalog } from '#services/catalog_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class MoviesController {
  async watch({ auth, params, response, session }: HttpContext) {
    const entry = await Movie.findByOrFail({ id: params.id, userId: auth.user!.id })

    if (!entry.isReleased) {
      session.flash('error', `${entry.name} has not been released yet.`)
      return response.redirect().back()
    }

    const catalogMovie = await catalog.find('movie', entry.providerId)

    if (!catalogMovie) {
      session.flash('error', 'Movie could not be found in the catalog.')
      return response.redirect().back()
    }

    await entry.watch(catalogMovie.type === 'movie' ? catalogMovie.duration : null)

    session.flash('success', `${entry.name} was marked as watched.`)
    return response.redirect().back()
  }

  async unwatch({ auth, params, response, session }: HttpContext) {
    const entry = await Movie.findByOrFail({ id: params.id, userId: auth.user!.id })

    await entry.unwatch()

    session.flash('success', `${entry.name} is no longer marked as watched.`)
    return response.redirect().back()
  }
}
