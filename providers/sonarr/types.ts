export type SonarrDriver = 'fake' | 'sonarr'

export abstract class SonarrProvider {}

export class SonarrProviderError extends Error {}

export type FakeSonarrProviderConfig = Record<string, never>

export type SonarrProviderDriverConfig = {
  baseUrl?: string
  apiKey?: string
}

export type SonarrProviderConfig = {
  default?: SonarrDriver
  drivers: {
    fake: FakeSonarrProviderConfig
    sonarr: SonarrProviderDriverConfig
  }
}
