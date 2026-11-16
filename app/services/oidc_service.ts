import OidcSettings from '#models/oidc_settings'
import env from '#start/env'
import encryption from '@adonisjs/core/services/encryption'
import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  discovery,
  randomNonce,
  randomState,
  randomPKCECodeVerifier,
  type Configuration,
} from 'openid-client'

const scopes = 'openid profile email'

export function oidcCallbackUrl() {
  return new URL('/app/auth/oidc/callback', env.get('APP_URL')).toString()
}

export type OidcAuthorizationRequest = {
  state: string
  nonce: string
  codeVerifier: string
  url: string
}

export type OidcClaims = {
  issuer: string
  sub: string
  email: string | null
  emailVerified: boolean | null
  preferredUsername: string | null
  name: string | null
}

export type OidcCodeExchange = {
  codeVerifier: string
  state: string
  nonce: string
}

export type OidcConfiguration = {
  issuerUrl: string
  clientId: string
  clientSecret: string
}

/**
 * Talks to the configured OIDC issuer. Settings come from the database and
 * discovery metadata is cached for the lifetime of the process.
 */
export default class OidcService {
  #discovery: { key: string; configuration: Configuration } | null = null

  get callbackUrl() {
    return oidcCallbackUrl()
  }

  async isEnabled() {
    const settings = await OidcSettings.current()

    return Boolean(
      settings?.enabled && settings.issuerUrl && settings.clientId && settings.clientSecret
    )
  }

  async createAuthorizationRequest(): Promise<OidcAuthorizationRequest> {
    const configuration = await this.#configuration()
    const state = randomState()
    const nonce = randomNonce()
    const codeVerifier = randomPKCECodeVerifier()

    // shortcut: no rate limit on the oidc endpoints, add @adonisjs/limiter if abuse shows up
    const url = buildAuthorizationUrl(configuration, {
      redirect_uri: this.callbackUrl,
      scope: scopes,
      state,
      nonce,
      code_challenge: await calculatePKCECodeChallenge(codeVerifier),
      code_challenge_method: 'S256',
    })

    return { state, nonce, codeVerifier, url: url.toString() }
  }

  async exchangeCode(currentUrl: URL, exchange: OidcCodeExchange): Promise<OidcClaims> {
    const configuration = await this.#configuration()
    const tokens = await authorizationCodeGrant(configuration, currentUrl, {
      pkceCodeVerifier: exchange.codeVerifier,
      expectedState: exchange.state,
      expectedNonce: exchange.nonce,
    })
    const claims = tokens.claims()

    if (!claims) throw new Error('OIDC response did not include an ID token')

    return {
      issuer: claims.iss,
      sub: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : null,
      emailVerified: typeof claims.email_verified === 'boolean' ? claims.email_verified : null,
      preferredUsername:
        typeof claims.preferred_username === 'string' ? claims.preferred_username : null,
      name: typeof claims.name === 'string' ? claims.name : null,
    }
  }

  /**
   * Fails when the issuer metadata cannot be discovered for the given settings.
   */
  async validateConfiguration({ issuerUrl, clientId, clientSecret }: OidcConfiguration) {
    await discovery(new URL(issuerUrl), clientId, clientSecret)
  }

  invalidate() {
    this.#discovery = null
  }

  async #configuration() {
    const settings = await OidcSettings.current()

    if (!settings?.issuerUrl || !settings.clientId || !settings.clientSecret) {
      throw new Error('OIDC is not configured')
    }

    const key = `${settings.issuerUrl}|${settings.clientId}|${settings.clientSecret}`

    if (this.#discovery?.key === key) return this.#discovery.configuration

    const clientSecret = encryption.decrypt<string>(settings.clientSecret)
    if (!clientSecret) throw new Error('OIDC client secret could not be decrypted')

    const configuration = await discovery(
      new URL(settings.issuerUrl),
      settings.clientId,
      clientSecret
    )

    this.#discovery = { key, configuration }

    return configuration
  }
}
