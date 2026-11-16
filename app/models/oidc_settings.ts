import { OidcSettingSchema } from '#database/schema'

/**
 * Single row holding the OIDC identity provider configuration.
 */
export default class OidcSettings extends OidcSettingSchema {
  static table = 'oidc_settings'

  static async current() {
    return OidcSettings.first()
  }
}
