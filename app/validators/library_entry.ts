import vine from '@vinejs/vine'

export const addLibraryEntryValidator = vine.create({
  provider: vine.literal('tmdb'),
  providerId: vine.string().trim().minLength(1).maxLength(255),
  type: vine.enum(['movie', 'series']),
  name: vine.string().trim().minLength(1).maxLength(255),
  bannerUrl: vine.string().trim().url().nullable(),
  releaseDate: vine
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  summary: vine.string().trim().nullable(),
})
