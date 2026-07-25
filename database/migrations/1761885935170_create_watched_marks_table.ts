import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'watched_marks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table
        .integer('library_entry_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('library_entries')
        .onDelete('CASCADE')
      table.string('provider_id').nullable()
      table.integer('season').unsigned().nullable()
      table.integer('episode').unsigned().nullable()
      table.string('name').nullable()
      table.date('released_at').nullable()
      table.integer('duration').unsigned().nullable()
      table.timestamp('watched_at').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    this.schema.raw(`
      CREATE UNIQUE INDEX watched_marks_movie_unique
      ON watched_marks (user_id, library_entry_id)
      WHERE season IS NULL AND episode IS NULL
    `)

    this.schema.raw(`
      CREATE UNIQUE INDEX watched_marks_episode_unique
      ON watched_marks (user_id, library_entry_id, season, episode)
      WHERE season IS NOT NULL AND episode IS NOT NULL
    `)
  }

  async down() {
    this.schema.raw('DROP INDEX IF EXISTS watched_marks_episode_unique')
    this.schema.raw('DROP INDEX IF EXISTS watched_marks_movie_unique')
    this.schema.dropTable(this.tableName)
  }
}
