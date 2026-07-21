import {
  CatalogProvider,
  CatalogProviderError,
  type CatalogTitleResult,
} from '#providers/catalog_provider/types'
import app from '@adonisjs/core/services/app'

let catalogProvider: CatalogProvider

await app.booted(async () => {
  catalogProvider = await app.container.make('catalog_provider')
})

export {
  CatalogProvider,
  CatalogProviderError,
  type CatalogTitleResult,
  catalogProvider as default,
}
