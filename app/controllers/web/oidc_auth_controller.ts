import User from '#models/user'
import OidcService, { type OidcClaims } from '#services/oidc_service'
import hash from '@adonisjs/core/services/hash'
import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'

type OidcSession = {
  state: string
  nonce: string
  codeVerifier: string
}

const usernamePattern = /^[a-z0-9_]{3,32}$/

export default class OidcAuthController {
  async redirect({ session, response, containerResolver }: HttpContext) {
    const oidc = await containerResolver.make(OidcService)
    if (!(await oidc.isEnabled())) return response.notFound()

    const request = await oidc.createAuthorizationRequest()

    session.put('oidc', {
      state: request.state,
      nonce: request.nonce,
      codeVerifier: request.codeVerifier,
    })

    return response.redirect(request.url)
  }

  async callback({ request, session, response, auth, logger, containerResolver }: HttpContext) {
    const oidc = await containerResolver.make(OidcService)
    if (!(await oidc.isEnabled())) return response.notFound()

    const pending = session.get('oidc') as OidcSession | undefined
    if (request.input('error')) {
      session.forget('oidc')
      session.flash('error', 'Sign in was cancelled.')
      return response.redirect().toRoute('app.login')
    }

    if (!pending || !request.input('state') || request.input('state') !== pending.state) {
      session.forget('oidc')
      return response.badRequest('Invalid or missing sign in state. Start the sign in again.')
    }

    let claims: OidcClaims

    try {
      claims = await oidc.exchangeCode(new URL(request.url(), oidc.callbackUrl), {
        codeVerifier: pending.codeVerifier,
        state: pending.state,
        nonce: pending.nonce,
      })
    } catch (error) {
      logger.warn({ errorName: (error as Error).name }, 'OIDC code exchange failed')
      session.flash('error', 'Sign in failed. Please try again.')
      return response.redirect().toRoute('app.login')
    } finally {
      session.forget('oidc')
    }

    if (!claims.email) {
      return response.badRequest('The identity provider did not return an email address.')
    }

    const provider = new URL(claims.issuer).hostname
    const email = claims.email.trim()
    let user = await User.findBy({ oidcProvider: provider, oidcSubject: claims.sub })

    if (!user) {
      if (claims.emailVerified === false) {
        return response.badRequest('The identity provider did not verify this email address.')
      }

      const existing = await User.findBy('email', email)

      if (existing?.oidcSubject) {
        return response.badRequest('This email is already linked to another sign in identity.')
      }

      if (existing) {
        existing.oidcProvider = provider
        existing.oidcSubject = claims.sub
        await existing.save()
        user = existing
      } else {
        user = await this.createUser(provider, email, claims)
      }
    }

    await auth.use('web').login(user)

    return response.redirect().toRoute('app.home')
  }

  private async createUser(provider: string, email: string, claims: OidcClaims) {
    const username = await this.availableUsername(claims.preferredUsername)
    const payload = {
      email,
      fullName: claims.name,
      // valid but unguessable hash, so local password login never matches oidc users
      password: await hash.make(randomUUID()),
      oidcProvider: provider,
      oidcSubject: claims.sub,
    }

    try {
      return await User.create({ ...payload, username })
    } catch {
      const created = await User.findBy({ oidcProvider: provider, oidcSubject: claims.sub })
      if (created) return created

      // retry once without the optional username, which may have been taken meanwhile
      if (!username) throw new Error('Could not create the user for this oidc identity')

      return User.create({ ...payload, username: null })
    }
  }

  private async availableUsername(preferred: string | null) {
    if (!preferred) return null

    const username = preferred.trim().toLowerCase()
    if (!usernamePattern.test(username)) return null

    return (await User.findBy('username', username)) ? null : username
  }
}
