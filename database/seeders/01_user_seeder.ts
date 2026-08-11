import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    await User.updateOrCreate(
      { email: 'dev@mail.com', username: 'dev' },
      { email: 'dev@mail.com', username: 'dev', fullName: 'Dev User', password: '123' }
    )
  }
}
