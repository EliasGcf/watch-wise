import vine from '@vinejs/vine'

export const addLibraryEntryValidator = vine.create({
  provider: vine.literal('tmdb'),
  providerId: vine.string().trim().minLength(1).maxLength(255),
  type: vine.enum(['movie', 'series']),
})
