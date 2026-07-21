import FakeCatalogProviderDriver from '#providers/catalog_provider/fake_driver'
import TmdbCatalogProviderDriver from '#providers/catalog_provider/tmdb_driver'
import {
  CatalogProvider,
  CatalogProviderError,
  type CatalogProviderConfig,
  type CatalogProviderDriver,
  type CatalogProviderDriverName,
} from '#providers/catalog_provider/types'

export class CatalogProviderManager extends CatalogProvider {
  #drivers = new Map<CatalogProviderDriverName, CatalogProviderDriver>()

  constructor(private config: CatalogProviderConfig) {
    super()
  }

  use(name: CatalogProviderDriverName = this.config.default) {
    const cachedDriver = this.#drivers.get(name)

    if (cachedDriver) return cachedDriver

    const driver = this.createDriver(name)
    this.#drivers.set(name, driver)

    return driver
  }

  search(query: string) {
    return this.use().search(query)
  }

  private createDriver(name: CatalogProviderDriverName) {
    if (name === 'fake') {
      return new FakeCatalogProviderDriver(this.config.drivers.fake)
    }

    if (name === 'tmdb') {
      return new TmdbCatalogProviderDriver(this.config.drivers.tmdb)
    }

    throw new CatalogProviderError(`Unsupported catalog provider driver "${name}"`)
  }
}
