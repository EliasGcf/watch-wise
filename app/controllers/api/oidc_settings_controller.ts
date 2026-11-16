import OidcSettings from '#models/oidc_settings'
import OidcService from '#services/oidc_service'
import OidcSettingsTransformer from '#transformers/oidc_settings_transformer'
import { updateOidcSettingsValidator } from '#validators/oidc_settings'
import encryption from '@adonisjs/core/services/encryption'
import type { HttpContext } from '@adonisjs/core/http'

type ValidationError = {
  field: string
  message: string
}

export default class OidcSettingsController {
  async show({ serialize }: HttpContext) {
    const settings = (await OidcSettings.current()) ?? new OidcSettings()

    return serialize(OidcSettingsTransformer.transform(settings))
  }

  async update({ request, response, serialize, containerResolver }: HttpContext) {
    const payload = await request.validateUsing(updateOidcSettingsValidator)
    const oidc = await containerResolver.make(OidcService)
    const settings = (await OidcSettings.current()) ?? new OidcSettings()
    const errors: ValidationError[] = []

    const issuerUrl = payload.issuerUrl?.replace(/\/+$/, '') || null
    const clientId = payload.clientId || null
    const clientSecret = payload.clientSecret || null
    const storedSecret = settings.clientSecret
      ? encryption.decrypt<string>(settings.clientSecret)
      : null

    if (payload.enabled && !issuerUrl) {
      errors.push({ field: 'issuerUrl', message: 'An issuer URL is required to enable OIDC.' })
    }

    if (payload.enabled && !clientId) {
      errors.push({ field: 'clientId', message: 'A client ID is required to enable OIDC.' })
    }

    if (payload.enabled && !clientSecret && !storedSecret) {
      errors.push({ field: 'clientSecret', message: 'A client secret is required to enable OIDC.' })
    }

    if (errors.length > 0) return response.unprocessableEntity({ errors })

    if (payload.enabled && issuerUrl && clientId) {
      try {
        await oidc.validateConfiguration({
          issuerUrl,
          clientId,
          clientSecret: clientSecret ?? storedSecret!,
        })
      } catch (error) {
        return response.unprocessableEntity({
          errors: [
            {
              field: 'issuerUrl',
              message: `Could not read the issuer metadata: ${(error as Error).message}`,
            },
          ],
        })
      }
    }

    settings.enabled = payload.enabled
    settings.issuerUrl = issuerUrl
    settings.clientId = clientId
    if (clientSecret) settings.clientSecret = encryption.encrypt(clientSecret)

    await settings.save()
    oidc.invalidate()

    return serialize(OidcSettingsTransformer.transform(settings))
  }
}
