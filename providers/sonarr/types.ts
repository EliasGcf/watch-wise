import type { EpisodeResource, SeriesResource } from '#generated/sonarr/types.gen'

export type SonarrDriver = 'fake' | 'sonarr'

export abstract class SonarrProvider {
  abstract deleteEpisodeFileByCatalogProviderId(
    providerId: string,
    season: number,
    episode: number
  ): Promise<void>
}

export class SonarrProviderError extends Error {}

export type DeletedSonarrEpisodeFile = {
  providerId: string
  season: number
  episode: number
  episodeFileId: number
}

export type FakeSonarrProviderConfig = {
  series?: SeriesResource[]
  episodes?: EpisodeResource[]
  deletedEpisodeFiles?: DeletedSonarrEpisodeFile[]
  failDeletion?: boolean
}

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
