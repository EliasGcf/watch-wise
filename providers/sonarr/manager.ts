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

  use(name: SonarrDriver | undefined = this._config.default) {
    if (!name) throw new SonarrProviderError('Sonarr provider is not configured.')

    const cachedDriver = this.#drivers.get(name)

    if (cachedDriver) return cachedDriver

    const driver = this.createDriver(name)
    this.#drivers.set(name, driver)

    return driver
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
