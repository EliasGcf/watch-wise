import FakeCatalogProviderDriver from '#providers/catalog/drivers/fake_driver'
import TmdbCatalogProviderDriver from '#providers/catalog/drivers/tmdb_driver'
import {
  CatalogProvider,
  CatalogProviderError,
  type ItemType,
  type CatalogProviderConfig,
  type CatalogDriver,
  type ImageKind,
  type ImageSize,
  type ImageUrls,
} from '#providers/catalog/types'

export class CatalogProviderManager extends CatalogProvider {
  #drivers = new Map<CatalogDriver, CatalogProvider>()

  constructor(private _config: CatalogProviderConfig) {
    super()
  }

  use(name: CatalogDriver = this._config.default) {
    const cachedDriver = this.#drivers.get(name)

    if (cachedDriver) return cachedDriver

    const driver = this.createDriver(name)
    this.#drivers.set(name, driver)

    return driver
  }

  config<T extends CatalogDriver>(
    driver: T = this._config.default as T
  ): CatalogProviderConfig['drivers'][T] {
    const config = this._config.drivers[driver]
    if (!config) throw new CatalogProviderError(`Unsupported catalog provider driver "${driver}"`)
    return config
  }

  private createDriver(name: CatalogDriver) {
    if (name === 'fake') {
      return new FakeCatalogProviderDriver(this._config.drivers.fake)
    }

    if (name === 'tmdb') {
      return new TmdbCatalogProviderDriver(this._config.drivers.tmdb)
    }

    throw new CatalogProviderError(`Unsupported catalog provider driver "${name}"`)
  }

  search(query: string) {
    return this.use().search(query)
  }

  weekTrending() {
    return this.use().weekTrending()
  }

  find(type: ItemType, providerId: string) {
    return this.use().find(type, providerId)
  }

  findMovieById(providerId: string) {
    return this.use().findMovieById(providerId)
  }

  findSerieById(providerId: string) {
    return this.use().findSerieById(providerId)
  }

  episodes(providerId: string, season: number) {
    return this.use().episodes(providerId, season)
  }

  findEpisode(serieId: string, season: number, episode: number) {
    return this.use().findEpisode(serieId, season, episode)
  }

  imageUrl(kind: ImageKind, path: string | null, size: ImageSize) {
    return this.use().imageUrl(kind, path, size)
  }

  imageUrls(kind: ImageKind, path: string | null): ImageUrls {
    return {
      sm: this.imageUrl(kind, path, 'sm'),
      md: this.imageUrl(kind, path, 'md'),
      lg: this.imageUrl(kind, path, 'lg'),
      original: this.imageUrl(kind, path, 'original'),
    }
  }
}
