import { RadarrProviderManager } from '#providers/radarr/manager'
import type { RadarrProviderConfig } from '#providers/radarr/types'
import type { ApplicationService } from '@adonisjs/core/types'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    radarr_provider: RadarrProviderManager
  }
}

export default class RadarrProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(RadarrProviderManager, () => {
      const config = this.app.config.get<RadarrProviderConfig>('radarr_provider')
      return new RadarrProviderManager(config)
    })

    this.app.container.alias('radarr_provider', RadarrProviderManager)
  }
}
