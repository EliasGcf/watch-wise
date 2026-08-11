import { type events } from '#generated/events'
import Serie from '#models/serie'
import UserSettings from '#models/user_settings'
import { isSonarrAvailable, sonarr } from '#services/sonarr_provider'
import logger from '@adonisjs/core/services/logger'

type Event = InstanceType<typeof events.EpisodeWatched>

export default class DeleteSonarrEpisodeFile {
  handle(event: Event) {
    if (event.$trx) {
      event.$trx.after('commit', () => this.deleteEpisodeFile(event))
      return
    }

    void this.deleteEpisodeFile(event)
  }

  async deleteEpisodeFile(event: Event) {
    if (!isSonarrAvailable()) return

    if (!event.deleteFile) {
      const settings = await UserSettings.findBy('userId', event.userId)
      if (!settings?.activeProviderActions.deleteSonarrEpisodeFiles) return
    }

    const serie = await Serie.query()
      .where('id', event.watched.libraryEntryId)
      .where('userId', event.userId)
      .firstOrFail()

    try {
      await sonarr.deleteEpisodeFileByCatalogProviderId(
        serie.providerId,
        event.watched.season,
        event.watched.episode
      )
    } catch (error) {
      logger.error(
        {
          err: error,
          userId: event.userId,
          libraryEntryId: event.watched.libraryEntryId,
          catalogProviderId: serie.providerId,
          season: event.watched.season,
          episode: event.watched.episode,
        },
        'Sonarr episode file deletion failed'
      )
    }
  }
}
