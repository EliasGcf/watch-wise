import type UserSettings from '#models/user_settings'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class UserSettingsTransformer extends BaseTransformer<UserSettings> {
  toObject() {
    return {
      deleteSonarrEpisodeFiles: Boolean(this.resource.deleteSonarrEpisodeFiles),
      deleteRadarrMovieFiles: Boolean(this.resource.deleteRadarrMovieFiles),
      activeProviderActions: this.resource.activeProviderActions,
    }
  }
}
