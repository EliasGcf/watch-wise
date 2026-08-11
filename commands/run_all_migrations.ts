import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

export default class RunAllMigrations extends BaseCommand {
  public static commandName = 'migration:run:all'
  public static description = 'Runs pending database migrations for all configured connections'

  @flags.boolean({ description: 'Force run the migrations' })
  declare force: boolean

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const dbConfig = this.app.config.get<any>('database')
    const connections = Object.keys(dbConfig.connections || {})

    if (connections.length === 0) {
      this.logger.warning('No database connections found in config/database.ts')
      return
    }

    for (const connection of connections) {
      this.logger.info(`Running migrations for connection: ${connection}`)

      const commandFlags = ['--connection', connection]

      if (this.force) commandFlags.push('--force')

      try {
        await this.kernel.exec('migration:run', commandFlags)
        this.logger.success(`Successfully migrated: [${connection}]`)
      } catch (error) {
        this.logger.error(`Failed to migrate: [${connection}]`)
        if (error instanceof Error) this.logger.error(error.message)
      }
    }
  }
}
