import User from '#models/user'
import { loginValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const identifier = email.trim()
    const uid = identifier.includes('@') ? identifier : identifier.toLowerCase()
    const user = await User.verifyCredentials(uid, password)

    await auth.use('web').login(user)
    response.redirect().toRoute('app.home')
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout()
    response.redirect().toRoute('app.login')
  }
}
