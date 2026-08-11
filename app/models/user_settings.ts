import { UserSettingSchema } from '#database/schema'
import User from '#models/user'
import { isRadarrAvailable } from '#services/radarr_provider'
import { isSonarrAvailable } from '#services/sonarr_provider'
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

  get providerAvailability() {
    return {
      sonarr: isSonarrAvailable(),
      radarr: isRadarrAvailable(),
    }
  }
}
