import vine from '@vinejs/vine'

export const seerrWebhookValidator = vine.create({
  notification_type: vine.string(),
  request: vine.object({
    requestedBy_username: vine.string(),
    requestedBy_email: vine.string(),
  }),
  media: vine.object({
    media_type: vine.enum(['movie', 'tv']),
    tmdbId: vine.string().trim().minLength(1),
  }),
})
