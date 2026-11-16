import vine from '@vinejs/vine'

export const updateOidcSettingsValidator = vine.create({
  enabled: vine.boolean(),
  issuerUrl: vine
    .string()
    .trim()
    .maxLength(255)
    .url({ protocols: ['http', 'https'], require_protocol: true })
    .nullable(),
  clientId: vine.string().trim().maxLength(255).nullable(),
  clientSecret: vine.string().trim().maxLength(255).nullable().optional(),
})
