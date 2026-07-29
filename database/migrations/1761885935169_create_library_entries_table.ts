import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'library_entries'

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
      table.string('provider').notNullable()
      table.string('provider_id').notNullable()
      table.enum('type', ['movie', 'serie']).notNullable()
      table.string('name').notNullable()
      table.string('banner_path').nullable()
      table.string('poster_path').nullable()
      table.date('released_at').nullable()
      table.text('summary').nullable()

      // Series only
      table.integer('progress').unsigned().nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'provider', 'provider_id'], {
        indexName: 'library_entries_provider_identity_unique',
      })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
