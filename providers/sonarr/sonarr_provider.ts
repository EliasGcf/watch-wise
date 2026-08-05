import { SonarrProviderManager } from '#providers/sonarr/manager'
import type { SonarrProviderConfig } from '#providers/sonarr/types'
import type { ApplicationService } from '@adonisjs/core/types'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    sonarr_provider: SonarrProviderManager
  }
}

export default class SonarrProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(SonarrProviderManager, () => {
      const config = this.app.config.get<SonarrProviderConfig>('sonarr_provider')
      return new SonarrProviderManager(config)
    })

    this.app.container.alias('sonarr_provider', SonarrProviderManager)
  }
}
