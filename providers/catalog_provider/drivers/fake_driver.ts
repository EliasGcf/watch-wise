import type {
  CatalogProviderDriver,
  CatalogTitleResult,
  FakeCatalogProviderConfig,
} from '#providers/catalog_provider/types'
import { CatalogProviderError } from '#providers/catalog_provider/types'

export default class FakeCatalogProviderDriver implements CatalogProviderDriver {
  constructor(private config: FakeCatalogProviderConfig) {}

  async search(query: string): Promise<CatalogTitleResult[]> {
    if (query === this.config.failureQuery) {
      throw new CatalogProviderError('Fake catalog provider failure')
    }

    return this.config.results
  }

  async find(
    providerId: string,
    type: CatalogTitleResult['type']
  ): Promise<CatalogTitleResult | null> {
    return (
      this.config.results.find(
        (result) => result.providerId === providerId && result.type === type
      ) ?? null
    )
  }
}
