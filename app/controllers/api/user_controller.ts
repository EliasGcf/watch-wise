import UserTransformer from '#transformers/user_transformer'
import { updateUsernameValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UserController {
  async update({ auth, request, response, serialize }: HttpContext) {
    const user = auth.user!
    const payload = await request.validateUsing(updateUsernameValidator, {
      meta: { userId: user.id },
    })

    if (user.username && !payload.username) {
      return response.unprocessableEntity({
        errors: [{ field: 'username', message: 'Username cannot be removed.' }],
      })
    }

    user.username = payload.username ?? user.username
    await user.save()

    return serialize(UserTransformer.transform(user))
  }
}
