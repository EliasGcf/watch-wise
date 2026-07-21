import { type CatalogProviderManager } from '#providers/catalog_provider/manager'
import { CatalogProviderError, type CatalogTitleResult } from '#providers/catalog_provider/types'
import app from '@adonisjs/core/services/app'

let catalogProvider!: CatalogProviderManager

await app.booted(async () => {
  catalogProvider = await app.container.make('catalog_provider')
})

export {
  CatalogProviderError,
  catalogProvider as default,
  type CatalogProviderManager,
  type CatalogTitleResult,
}
