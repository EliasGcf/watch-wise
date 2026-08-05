export type SonarrDriver = 'fake' | 'sonarr'

export abstract class SonarrProvider {
  abstract deleteEpisodeFileByCatalogProviderId(
    providerId: string,
    season: number,
    episode: number
  ): Promise<void>
}

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
