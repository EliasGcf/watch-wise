import { UserSchema } from '#database/schema'
import LibraryItem from '#models/library_item'
import Movie from '#models/movie'
import Serie from '#models/serie'
import UserSettings from '#models/user_settings'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { computed, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  @hasMany(() => LibraryItem)
  declare libraryEntries: HasMany<typeof LibraryItem>

  @hasMany(() => Movie)
  declare movies: HasMany<typeof Movie>

  @hasMany(() => Serie)
  declare series: HasMany<typeof Serie>

  @hasOne(() => UserSettings)
  declare userSettings: HasOne<typeof UserSettings>

  async settings() {
    return UserSettings.firstOrCreate(
      { userId: this.id },
      { userId: this.id, deleteSonarrEpisodeFiles: false, deleteRadarrMovieFiles: false }
    )
  }

  @computed()
  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
