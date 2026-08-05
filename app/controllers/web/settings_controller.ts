import { isRadarrAvailable } from '#services/radarr_provider'
import { isSonarrAvailable } from '#services/sonarr_provider'
import type { HttpContext } from '@adonisjs/core/http'

export default class SettingsController {
  async index({ auth, inertia }: HttpContext) {
    const settings = await auth.user!.getSettings()

    return inertia.render('settings', {
      integrations: {
        sonarr: {
          available: isSonarrAvailable(),
          deleteEpisodeFiles: Boolean(settings.deleteSonarrEpisodeFiles),
        },
        radarr: {
          available: isRadarrAvailable(),
          deleteMovieFiles: Boolean(settings.deleteRadarrMovieFiles),
        },
      },
    })
  }
}
