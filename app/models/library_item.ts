import { LibraryEntrySchema } from '#database/schema'
import Movie from '#models/movie'
import Show from '#models/show'

type LibraryEntryModel = Movie | Show

export default class LibraryItem extends LibraryEntrySchema {
  static table = 'library_entries'

  static async forUser(userId: number): Promise<LibraryEntryModel[]> {
    const entries = await this.query().where('userId', userId).orderBy('createdAt', 'desc')
    return entries.map(this.fromEntry)
  }

  static fromEntry(entry: LibraryItem): LibraryEntryModel {
    const item = entry.type === 'movie' ? new Movie() : new Show()

    item.$isPersisted = entry.$isPersisted
    item.merge(entry.$attributes)

    return item
  }
}
