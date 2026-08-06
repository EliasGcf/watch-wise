import FakeSonarrProviderDriver from '#providers/sonarr/drivers/fake_driver'
import SonarrProviderDriver from '#providers/sonarr/drivers/sonarr_driver'
import {
  SonarrProvider,
  SonarrProviderError,
  type SonarrDriver,
  type SonarrProviderConfig,
} from '#providers/sonarr/types'

export class SonarrProviderManager extends SonarrProvider {
  #drivers = new Map<SonarrDriver, SonarrProvider>()

  constructor(private _config: SonarrProviderConfig) {
    super()
  }

  use(name: SonarrDriver = this.enabledDriver()) {
    if (name === 'fake') return this.createDriver(name)

    const cachedDriver = this.#drivers.get(name)

    if (cachedDriver) return cachedDriver

    const driver = this.createDriver(name)
    this.#drivers.set(name, driver)

    return driver
  }

  config<T extends SonarrDriver>(
    driver: T = this.enabledDriver() as T
  ): SonarrProviderConfig['drivers'][T] {
    const config = this._config.drivers[driver]
    if (!config) throw new SonarrProviderError(`Unsupported Sonarr provider driver "${driver}"`)
    return config
  }

  private enabledDriver() {
    if (!this._config.default) throw new SonarrProviderError('Sonarr provider is not configured.')

    return this._config.default
  }

  private createDriver(name: SonarrDriver) {
    if (name === 'fake') {
      return new FakeSonarrProviderDriver()
    }

    if (name === 'sonarr') {
      return new SonarrProviderDriver(this._config.drivers.sonarr)
    }

    throw new SonarrProviderError(`Unsupported Sonarr provider driver "${name}"`)
  }

  deleteEpisodeFileByCatalogProviderId(providerId: string, season: number, episode: number) {
    return this.use().deleteEpisodeFileByCatalogProviderId(providerId, season, episode)
  }
}
