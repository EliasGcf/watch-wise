import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('watched_time').unsigned().notNullable().defaultTo(0)
    })

    this.schema.raw(`
      UPDATE users
      SET watched_time = (
        SELECT COALESCE(SUM(duration), 0)
        FROM watched_marks
        WHERE watched_marks.user_id = users.id
      )
    `)
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('watched_time')
    })
  }
}
