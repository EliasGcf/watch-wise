import { UserSettingSchema } from '#database/schema'
import type { RadarrProviderConfig } from '#providers/radarr/types'
import type { SonarrProviderConfig } from '#providers/sonarr/types'
import app from '@adonisjs/core/services/app'

export default class UserSettings extends UserSettingSchema {
  static table = 'user_settings'

  get activeProviderActions() {
    return {
      deleteSonarrEpisodeFiles: Boolean(this.deleteSonarrEpisodeFiles) && isSonarrAvailable(),
      deleteRadarrMovieFiles: Boolean(this.deleteRadarrMovieFiles) && isRadarrAvailable(),
    }
  }
}

export function isSonarrAvailable() {
  return Boolean(app.config.get<SonarrProviderConfig>('sonarr_provider').default)
}

export function isRadarrAvailable() {
  return Boolean(app.config.get<RadarrProviderConfig>('radarr_provider').default)
}
