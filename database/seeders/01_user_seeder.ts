import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  static environment = ['development']

  async run() {
    await User.updateOrCreate(
      { email: 'dev@mail.com' },
      { email: 'dev@mail.com', fullName: 'Dev User', password: '12345678' }
    )
  }
}
