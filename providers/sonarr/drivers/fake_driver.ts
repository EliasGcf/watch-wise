import { SonarrProvider } from '#providers/sonarr/types'

export default class FakeSonarrProviderDriver extends SonarrProvider {
  async deleteEpisodeFileByCatalogProviderId() {}
}
