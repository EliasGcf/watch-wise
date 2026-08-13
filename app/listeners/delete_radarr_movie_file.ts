import { type events } from '#generated/events'
import Movie from '#models/movie'
import UserSettings from '#models/user_settings'
import { isRadarrAvailable, radarr } from '#services/radarr_provider'
import logger from '@adonisjs/core/services/logger'

type Event = InstanceType<typeof events.MovieWatched>

export default class DeleteRadarrMovieFile {
  async handle(event: Event) {
    if (event.$trx) {
      event.$trx.after('commit', () => this.deleteMovieFile(event))
      return
    }

    await this.deleteMovieFile(event)
  }

  async deleteMovieFile(event: Event) {
    if (!isRadarrAvailable()) return

    if (!event.deleteFile) {
      const settings = await UserSettings.findBy('userId', event.userId)
      if (!settings?.activeProviderActions.deleteRadarrMovieFiles) return
    }

    const movie = await Movie.query()
      .where('id', event.watched.libraryEntryId)
      .where('userId', event.userId)
      .firstOrFail()

    try {
      await radarr.deleteMovieFileByCatalogProviderId(movie.providerId)
    } catch (error) {
      logger.error(
        {
          err: error,
          userId: event.userId,
          libraryEntryId: event.watched.libraryEntryId,
          catalogProviderId: movie.providerId,
        },
        'Radarr movie file deletion failed'
      )
    }
  }
}
