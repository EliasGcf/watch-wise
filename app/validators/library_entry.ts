import vine from '@vinejs/vine'

export const addLibraryEntryValidator = vine.create({
  provider: vine.literal('tmdb'),
  providerId: vine.string().trim().minLength(1).maxLength(255),
  type: vine.enum(['movie', 'series']),
  name: vine.string().trim().minLength(1).maxLength(255),
  bannerUrl: vine.string().trim().url().nullable(),
  releaseYear: vine.number().withoutDecimals().min(1800).max(3000).nullable(),
  summary: vine.string().trim().nullable(),
})
