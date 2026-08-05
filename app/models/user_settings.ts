import { UserSettingSchema } from '#database/schema'
import User from '#models/user'
import type { RadarrProviderConfig } from '#providers/radarr/types'
import type { SonarrProviderConfig } from '#providers/sonarr/types'
import app from '@adonisjs/core/services/app'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class UserSettings extends UserSettingSchema {
  static table = 'user_settings'

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

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
