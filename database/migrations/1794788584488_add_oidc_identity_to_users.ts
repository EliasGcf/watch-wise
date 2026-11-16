import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('oidc_provider', 64).nullable()
      table.string('oidc_subject', 255).nullable()
      table.unique(['oidc_provider', 'oidc_subject'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['oidc_provider', 'oidc_subject'])
      table.dropColumn('oidc_provider')
      table.dropColumn('oidc_subject')
    })
  }
}
