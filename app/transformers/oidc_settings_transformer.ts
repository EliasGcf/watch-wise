import type OidcSettings from '#models/oidc_settings'
import { oidcCallbackUrl } from '#services/oidc_service'
import { BaseTransformer } from '@adonisjs/core/transformers'

export default class OidcSettingsTransformer extends BaseTransformer<OidcSettings> {
  toObject() {
    return {
      enabled: Boolean(this.resource.enabled),
      issuerUrl: this.resource.issuerUrl ?? null,
      clientId: this.resource.clientId ?? null,
      hasSecret: Boolean(this.resource.clientSecret),
      callbackUrl: oidcCallbackUrl(),
    }
  }
}
