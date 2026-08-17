import { type CatalogProviderManager } from '#providers/catalog/manager'
import {
  CatalogProviderError,
  type CatalogSearchResult,
  type FindResult,
  type ImageKind,
  type ImageUrls,
} from '#providers/catalog/types'
import app from '@adonisjs/core/services/app'

let catalog!: CatalogProviderManager

await app.booted(async () => {
  catalog = await app.container.make('catalog_provider')
})

export function buildImageUrls(kind: ImageKind, path: string | null): ImageUrls {
  return {
    sm: catalog.imageUrl(kind, path, 'sm'),
    md: catalog.imageUrl(kind, path, 'md'),
    lg: catalog.imageUrl(kind, path, 'lg'),
    original: catalog.imageUrl(kind, path, 'original'),
  }
}

export {
  CatalogProviderError,
  catalog,
  type CatalogProviderManager,
  type CatalogSearchResult,
  type FindResult,
}
