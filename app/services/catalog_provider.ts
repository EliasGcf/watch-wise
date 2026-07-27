import { type CatalogProviderManager } from '#providers/catalog/manager'
import {
  CatalogProviderError,
  type CatalogSearchResult,
  type FindResult,
} from '#providers/catalog/types'
import app from '@adonisjs/core/services/app'

let catalog!: CatalogProviderManager

await app.booted(async () => {
  catalog = await app.container.make('catalog_provider')
})

export {
  CatalogProviderError,
  catalog,
  type CatalogProviderManager,
  type CatalogSearchResult,
  type FindResult,
}
