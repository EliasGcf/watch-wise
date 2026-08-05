export type RadarrDriver = 'fake' | 'radarr'

export abstract class RadarrProvider {}

export class RadarrProviderError extends Error {}

export type FakeRadarrProviderConfig = Record<string, never>

export type RadarrProviderDriverConfig = {
  baseUrl?: string
  apiKey?: string
}

export type RadarrProviderConfig = {
  default?: RadarrDriver
  drivers: {
    fake: FakeRadarrProviderConfig
    radarr: RadarrProviderDriverConfig
  }
}
