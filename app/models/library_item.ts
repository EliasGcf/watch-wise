import { LibraryEntrySchema } from '#database/schema'
import { catalog } from '#services/catalog_provider'
import { beforeSave, computed } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class LibraryItem extends LibraryEntrySchema {
  static table = 'library_entries'

  @computed()
  get isReleased() {
    return Boolean(this.releasedAt && this.releasedAt <= DateTime.now())
  }

  @computed()
  get bannerUrl() {
    return new URL(this.bannerPath, catalog.config().baseImageUrl).toString()
  }

  @computed()
  get posterUrl() {
    return new URL(this.posterPath, catalog.config().baseImageUrl).toString()
  }

  @beforeSave()
  static fixPaths(libraryItem: LibraryItem) {
    if (libraryItem.$dirty.bannerPath) {
      libraryItem.bannerPath = libraryItem.bannerPath.replace(/^\/+/, '')
    }

    if (libraryItem.$dirty.posterPath) {
      libraryItem.posterPath = libraryItem.posterPath.replace(/^\/+/, '')
    }
  }
}
