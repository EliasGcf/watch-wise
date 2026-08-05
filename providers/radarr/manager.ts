import FakeRadarrProviderDriver from '#providers/radarr/drivers/fake_driver'
import RadarrProviderDriver from '#providers/radarr/drivers/radarr_driver'
import {
  RadarrProvider,
  RadarrProviderError,
  type RadarrDriver,
  type RadarrProviderConfig,
} from '#providers/radarr/types'

export class RadarrProviderManager extends RadarrProvider {
  #drivers = new Map<RadarrDriver, RadarrProvider>()

  constructor(private _config: RadarrProviderConfig) {
    super()
  }

  use(name: RadarrDriver = this.enabledDriver()) {
    const cachedDriver = this.#drivers.get(name)

    if (cachedDriver) return cachedDriver

    const driver = this.createDriver(name)
    this.#drivers.set(name, driver)

    return driver
  }

  config<T extends RadarrDriver>(
    driver: T = this.enabledDriver() as T
  ): RadarrProviderConfig['drivers'][T] {
    const config = this._config.drivers[driver]
    if (!config) throw new RadarrProviderError(`Unsupported Radarr provider driver "${driver}"`)
    return config
  }

  private enabledDriver() {
    if (!this._config.default) throw new RadarrProviderError('Radarr provider is not configured.')

    return this._config.default
  }

  private createDriver(name: RadarrDriver) {
    if (name === 'fake') {
      return new FakeRadarrProviderDriver()
    }

    if (name === 'radarr') {
      return new RadarrProviderDriver(this._config.drivers.radarr)
    }

    throw new RadarrProviderError(`Unsupported Radarr provider driver "${name}"`)
  }
}
