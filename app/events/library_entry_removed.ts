import type LibraryItem from '#models/library_item'
import { BaseEvent } from '@adonisjs/core/events'

export default class LibraryEntryRemoved extends BaseEvent {
  readonly action = 'decrement'

  get $trx() {
    return this.entry.$trx
  }

  constructor(public entry: LibraryItem) {
    super()
  }
}
