import OidcService from '#services/oidc_service'
import type { ApplicationService } from '@adonisjs/core/types'

export default class OidcProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton(OidcService, () => new OidcService())
  }
}
