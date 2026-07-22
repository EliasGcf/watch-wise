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
      table.string('provider_title_id').notNullable()
      table.string('title_type').notNullable()
      table.string('title_name').notNullable()
      table.string('banner_url').nullable()
      table.integer('release_year').nullable()
      table.text('summary').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'provider', 'provider_title_id'], 'library_entries_title_unique')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
