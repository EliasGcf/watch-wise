import FakeCatalogProviderDriver from '#providers/catalog_provider/drivers/fake_driver'
import TmdbCatalogProviderDriver from '#providers/catalog_provider/drivers/tmdb_driver'
import {
  CatalogProvider,
  CatalogProviderError,
  type ItemType,
  type CatalogProviderConfig,
  type CatalogDriver,
} from '#providers/catalog_provider/types'

export class CatalogProviderManager extends CatalogProvider {
  #drivers = new Map<CatalogDriver, CatalogProvider>()

  constructor(private config: CatalogProviderConfig) {
    super()
  }

  use(name: CatalogDriver = this.config.default) {
    const cachedDriver = this.#drivers.get(name)

    if (cachedDriver) return cachedDriver

    const driver = this.createDriver(name)
    this.#drivers.set(name, driver)

    return driver
  }

  private createDriver(name: CatalogDriver) {
    if (name === 'fake') {
      return new FakeCatalogProviderDriver(this.config.drivers.fake)
    }

    if (name === 'tmdb') {
      return new TmdbCatalogProviderDriver(this.config.drivers.tmdb)
    }

    throw new CatalogProviderError(`Unsupported catalog provider driver "${name}"`)
  }

  search(query: string) {
    return this.use().search(query)
  }

  find(type: ItemType, providerId: string) {
    return this.use().find(type, providerId)
  }
}
