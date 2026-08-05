import { isRadarrAvailable } from '#services/radarr_provider'
import { isSonarrAvailable } from '#services/sonarr_provider'
import UserSettingsTransformer from '#transformers/user_settings_transformer'
import type { HttpContext } from '@adonisjs/core/http'

export default class SettingsController {
  async index({ auth, inertia }: HttpContext) {
    const settings = await auth.user!.getSettings()

    return inertia.render('settings', {
      settings: UserSettingsTransformer.transform(settings),
      providerAvailability: {
        sonarr: isSonarrAvailable(),
        radarr: isRadarrAvailable(),
      },
    })
  }
}
