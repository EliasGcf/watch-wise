import OidcSettings from '#models/oidc_settings'
import User from '#models/user'
import OidcService, { type OidcAuthorizationRequest, type OidcClaims } from '#services/oidc_service'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

const authorizationRequest: OidcAuthorizationRequest = {
  state: 'state-1',
  nonce: 'nonce-1',
  codeVerifier: 'verifier-1',
  url: 'https://id.example.com/authorize?state=state-1',
}

const pendingOidc = {
  state: authorizationRequest.state,
  nonce: authorizationRequest.nonce,
  codeVerifier: authorizationRequest.codeVerifier,
}

function claims(overrides: Partial<OidcClaims> = {}): OidcClaims {
  return {
    issuer: 'https://id.example.com',
    sub: 'subject-1',
    email: 'oidc-user@example.com',
    emailVerified: true,
    preferredUsername: null,
    name: 'OIDC User',
    ...overrides,
  }
}

class FakeOidcService {
  enabled = true
  claims: OidcClaims = claims()
  exchangeError: Error | null = null
  validationError: Error | null = null
  callbackUrl = 'http://localhost:3334/app/auth/oidc/callback'
  exchangedUrl: URL | null = null

  isEnabled() {
    return this.enabled
  }

  async createAuthorizationRequest() {
    return authorizationRequest
  }

  async exchangeCode(url: URL) {
    this.exchangedUrl = url
    if (this.exchangeError) throw this.exchangeError
    return this.claims
  }

  async validateConfiguration() {
    if (this.validationError) throw this.validationError
  }

  invalidate() {}
}

function locationPath(response: { header: (name: string) => string | undefined }) {
  return new URL(response.header('location')!, 'http://localhost').pathname
}

test.group('OIDC sign in', (group) => {
  let oidc: FakeOidcService

  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => {
    oidc = new FakeOidcService()
    app.container.swap(OidcService, () => oidc as unknown as OidcService)

    return () => app.container.restore(OidcService)
  })

  test('redirects visitors to the configured provider and keeps the request in session', async ({
    assert,
    client,
  }) => {
    const response = await client.get('/app/auth/oidc/redirect').redirects(0)

    response.assertStatus(302)
    assert.equal(response.header('location'), authorizationRequest.url)
    response.assertSession('oidc', pendingOidc)
  })

  test('responds 404 when single sign-on is disabled', async ({ assert, client }) => {
    oidc.enabled = false

    const redirect = await client.get('/app/auth/oidc/redirect').redirects(0)
    redirect.assertStatus(404)

    const callback = await client
      .get('/app/auth/oidc/callback?code=code-1&state=state-1')
      .redirects(0)
    callback.assertStatus(404)

    const login = await client.get('/app/login').withInertia()
    login.assertOk()
    assert.isFalse(login.inertiaProps.oidcEnabled)
  })

  test('offers single sign-on on the login page when it is enabled', async ({ assert, client }) => {
    const login = await client.get('/app/login').withInertia()

    login.assertOk()
    assert.isTrue(login.inertiaProps.oidcEnabled)
  })

  test('rejects a callback without the state kept in session', async ({ client }) => {
    const response = await client.get('/app/auth/oidc/callback?code=code-1').redirects(0)

    response.assertStatus(400)
    response.assertSessionMissing('oidc')
  })

  test('rejects a callback whose state does not match the session', async ({ client }) => {
    const response = await client
      .get('/app/auth/oidc/callback?code=code-1&state=other-state')
      .withSession({ oidc: pendingOidc })
      .redirects(0)

    response.assertStatus(400)
    response.assertSessionMissing('oidc')
  })

  test('creates a user for a new subject and signs them in', async ({ assert, client }) => {
    oidc.claims = claims({ preferredUsername: 'Oidc_User' })

    const response = await client
      .get('/app/auth/oidc/callback?code=code-1&state=state-1')
      .withSession({ oidc: pendingOidc })
      .redirects(0)

    response.assertStatus(302)
    assert.equal(locationPath(response), '/app')
    assert.include(oidc.exchangedUrl!.search, 'code=code-1')
    assert.include(oidc.exchangedUrl!.search, 'state=state-1')
    response.assertSessionMissing('oidc')

    const user = await User.findBy('email', 'oidc-user@example.com')
    assert.exists(user)
    assert.equal(user!.oidcProvider, 'id.example.com')
    assert.equal(user!.oidcSubject, 'subject-1')
    assert.equal(user!.username, 'oidc_user')
    assert.equal(user!.fullName, 'OIDC User')
    response.assertSession('auth_web', user!.id)
    await assert.rejects(() => User.verifyCredentials('oidc-user@example.com', 'anything'))
  })

  test('reuses the same user on a second sign in with the same subject', async ({
    assert,
    client,
  }) => {
    await client
      .get('/app/auth/oidc/callback?code=code-1&state=state-1')
      .withSession({ oidc: pendingOidc })
      .redirects(0)
    const first = await User.findBy('email', 'oidc-user@example.com')

    await client
      .get('/app/auth/oidc/callback?code=code-2&state=state-1')
      .withSession({ oidc: pendingOidc })
      .redirects(0)

    const users = await User.query().where('oidcSubject', 'subject-1')
    assert.lengthOf(users, 1)
    assert.equal(users[0].id, first!.id)
  })

  test('links an existing user by verified email and keeps their credentials', async ({
    assert,
    client,
  }) => {
    const existing = await User.create({
      fullName: 'Linked User',
      email: 'linked-user@example.com',
      password: 'secret123',
      username: 'linked_user',
    })
    const password = existing.password

    oidc.claims = claims({ email: 'linked-user@example.com', sub: 'subject-linked' })

    const response = await client
      .get('/app/auth/oidc/callback?code=code-1&state=state-1')
      .withSession({ oidc: pendingOidc })
      .redirects(0)

    response.assertStatus(302)
    await existing.refresh()
    assert.equal(existing.oidcProvider, 'id.example.com')
    assert.equal(existing.oidcSubject, 'subject-linked')
    assert.equal(existing.email, 'linked-user@example.com')
    assert.equal(existing.username, 'linked_user')
    assert.equal(existing.password, password)
  })

  test('does not link an existing user when the email is not verified', async ({
    assert,
    client,
  }) => {
    const existing = await User.create({
      email: 'unverified-user@example.com',
      password: 'secret123',
    })

    oidc.claims = claims({
      email: 'unverified-user@example.com',
      sub: 'subject-unverified',
      emailVerified: false,
    })

    const response = await client
      .get('/app/auth/oidc/callback?code=code-1&state=state-1')
      .withSession({ oidc: pendingOidc })
      .redirects(0)

    response.assertStatus(400)
    await existing.refresh()
    assert.isNull(existing.oidcSubject)
    assert.isNull(await User.findBy('oidcSubject', 'subject-unverified'))
  })

  test('rejects a callback without an email claim', async ({ assert, client }) => {
    oidc.claims = claims({ email: null })

    const response = await client
      .get('/app/auth/oidc/callback?code=code-1&state=state-1')
      .withSession({ oidc: pendingOidc })
      .redirects(0)

    response.assertStatus(400)
    assert.isNull(await User.findBy('oidcSubject', 'subject-1'))
  })

  test('sends the visitor back to the login page when the code exchange fails', async ({
    assert,
    client,
  }) => {
    oidc.exchangeError = new Error('invalid grant')

    const response = await client
      .get('/app/auth/oidc/callback?code=code-1&state=state-1')
      .withSession({ oidc: pendingOidc })
      .redirects(0)

    response.assertStatus(302)
    assert.equal(locationPath(response), '/app/login')
    assert.notInclude(response.header('location')!, 'code=')
    response.assertSessionMissing('oidc')
    response.assertSessionMissing('auth_web')
  })
})

test.group('OIDC settings', (group) => {
  let oidc: FakeOidcService

  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => {
    oidc = new FakeOidcService()
    app.container.swap(OidcService, () => oidc as unknown as OidcService)

    return () => app.container.restore(OidcService)
  })

  test('stores the settings without exposing the client secret', async ({ assert, client }) => {
    const user = await User.create({ email: 'owner@example.com', password: 'secret123' })

    const response = await client
      .patch('/api/settings/oidc')
      .json({
        enabled: true,
        issuerUrl: 'https://id.example.com/',
        clientId: 'watch-wise',
        clientSecret: 'super-secret',
      })
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    response.assertBodyContains({
      data: {
        enabled: true,
        issuerUrl: 'https://id.example.com',
        clientId: 'watch-wise',
        hasSecret: true,
        callbackUrl: 'http://localhost:3334/app/auth/oidc/callback',
      },
    })
    assert.notProperty(response.body().data, 'clientSecret')

    const stored = await OidcSettings.current()
    assert.exists(stored)
    assert.notEqual(stored!.clientSecret, 'super-secret')
    assert.equal(stored!.issuerUrl, 'https://id.example.com')
  })

  test('returns the stored settings without the client secret', async ({ assert, client }) => {
    const user = await User.create({ email: 'reader@example.com', password: 'secret123' })

    await client
      .patch('/api/settings/oidc')
      .json({
        enabled: true,
        issuerUrl: 'https://id.example.com',
        clientId: 'watch-wise',
        clientSecret: 'super-secret',
      })
      .loginAs(user)
      .withCsrfToken()

    const response = await client.get('/api/settings/oidc').loginAs(user)

    response.assertOk()
    response.assertBodyContains({ data: { enabled: true, hasSecret: true } })
    assert.notProperty(response.body().data, 'clientSecret')
  })

  test('keeps the stored secret when the field is left empty', async ({ assert, client }) => {
    const user = await User.create({ email: 'keeper@example.com', password: 'secret123' })

    await client
      .patch('/api/settings/oidc')
      .json({
        enabled: true,
        issuerUrl: 'https://id.example.com',
        clientId: 'watch-wise',
        clientSecret: 'super-secret',
      })
      .loginAs(user)
      .withCsrfToken()

    const stored = await OidcSettings.current()
    const encryptedSecret = stored!.clientSecret

    const response = await client
      .patch('/api/settings/oidc')
      .json({
        enabled: true,
        issuerUrl: 'https://id.example.com',
        clientId: 'watch-wise',
        clientSecret: null,
      })
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    response.assertBodyContains({ data: { hasSecret: true } })

    const updated = await OidcSettings.current()
    assert.equal(updated!.clientSecret, encryptedSecret)
  })

  test('requires a client secret to enable single sign-on', async ({ assert, client }) => {
    const user = await User.create({ email: 'no-secret@example.com', password: 'secret123' })

    const response = await client
      .patch('/api/settings/oidc')
      .json({
        enabled: true,
        issuerUrl: 'https://id.example.com',
        clientId: 'watch-wise',
        clientSecret: null,
      })
      .loginAs(user)
      .withCsrfToken()

    response.assertStatus(422)
    assert.isNull(await OidcSettings.current())
  })

  test('rejects settings whose issuer metadata cannot be read', async ({ assert, client }) => {
    const user = await User.create({ email: 'broken@example.com', password: 'secret123' })
    oidc.validationError = new Error('discovery failed')

    const response = await client
      .patch('/api/settings/oidc')
      .json({
        enabled: true,
        issuerUrl: 'https://broken.example.com',
        clientId: 'watch-wise',
        clientSecret: 'super-secret',
      })
      .loginAs(user)
      .withCsrfToken()

    response.assertStatus(422)
    assert.isNull(await OidcSettings.current())
  })
})
