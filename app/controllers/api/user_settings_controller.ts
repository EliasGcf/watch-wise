import { isRadarrAvailable, isSonarrAvailable } from '#models/user_settings'
import UserSettingsTransformer from '#transformers/user_settings_transformer'
import { updateUserSettingsValidator } from '#validators/user_settings'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserSettingsController {
  async show({ auth, serialize }: HttpContext) {
    return serialize(UserSettingsTransformer.transform(await auth.user!.settings()))
  }

  async update({ auth, request, response, serialize }: HttpContext) {
    const payload = await request.validateUsing(updateUserSettingsValidator)
    const errors = []

    if (payload.deleteSonarrEpisodeFiles !== undefined && !isSonarrAvailable()) {
      errors.push({ field: 'deleteSonarrEpisodeFiles', message: 'Sonarr is not available.' })
    }

    if (payload.deleteRadarrMovieFiles !== undefined && !isRadarrAvailable()) {
      errors.push({ field: 'deleteRadarrMovieFiles', message: 'Radarr is not available.' })
    }

    if (errors.length > 0) return response.unprocessableEntity({ errors })

    const settings = await auth.user!.settings()
    settings.merge(payload)
    await settings.save()

    return serialize(UserSettingsTransformer.transform(settings))
  }
}
