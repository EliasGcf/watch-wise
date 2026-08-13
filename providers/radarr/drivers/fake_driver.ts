import { RadarrProvider } from '#providers/radarr/types'

export default class FakeRadarrProviderDriver extends RadarrProvider {
  async deleteMovieFileByCatalogProviderId() {}
}
