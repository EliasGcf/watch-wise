import { CatalogProviderManager } from '#providers/catalog_provider/manager'
import type { CatalogProviderConfig } from '#providers/catalog_provider/types'
import type { ApplicationService } from '@adonisjs/core/types'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    catalog_provider: CatalogProviderManager
  }
}

export default class CatalogProviderProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(CatalogProviderManager, () => {
      const config = this.app.config.get<CatalogProviderConfig>('catalog_provider')

      return new CatalogProviderManager(config)
    })

    this.app.container.alias('catalog_provider', CatalogProviderManager)
  }
}
