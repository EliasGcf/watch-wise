import { LibraryEntrySchema } from '#database/schema'
import { events } from '#generated/events'
import { catalog } from '#services/catalog_provider'
import { beforeDelete, beforeSave, computed, scope } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class LibraryItem extends LibraryEntrySchema {
  static table = 'library_entries'

  @computed()
  get isReleased() {
    return Boolean(this.releasedAt && this.releasedAt <= DateTime.now())
  }

  @computed()
  get bannerUrl() {
    if (!this.bannerPath) return null

    return new URL(this.bannerPath, catalog.config().baseImageUrl).toString()
  }

  @computed()
  get posterUrl() {
    if (!this.posterPath) return null

    return new URL(this.posterPath, catalog.config().baseImageUrl).toString()
  }

  static search = scope((query, params: { name: string }) => {
    const name = params.name.trim().toLowerCase()

    if (name) query.whereRaw('lower(name) like ?', [`%${name}%`])

    query.orderByRaw(`
      COALESCE(
        (SELECT MAX(watched_at)
         FROM watched_marks
         WHERE watched_marks.library_entry_id = library_entries.id),
        library_entries.created_at
      ) DESC
    `)
  })

  @beforeSave()
  static fixPaths(libraryItem: LibraryItem) {
    if (libraryItem.$dirty.bannerPath && libraryItem.bannerPath) {
      libraryItem.bannerPath = libraryItem.bannerPath.replace(/^\/+/, '')
    }

    if (libraryItem.$dirty.posterPath && libraryItem.posterPath) {
      libraryItem.posterPath = libraryItem.posterPath.replace(/^\/+/, '')
    }
  }

  @beforeDelete()
  static async dispatchLibraryEntryRemoved(entry: LibraryItem) {
    await events.LibraryEntryRemoved.dispatch(entry)
  }
}
