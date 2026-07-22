import vine from '@vinejs/vine'

export const addLibraryEntryValidator = vine.create({
  provider: vine.literal('tmdb'),
  providerTitleId: vine.string().trim().minLength(1).maxLength(255),
  titleType: vine.enum(['movie', 'series']),
  titleName: vine.string().trim().minLength(1).maxLength(255),
  bannerUrl: vine.string().trim().url().nullable(),
  releaseYear: vine.number().withoutDecimals().min(1800).max(3000).nullable(),
  summary: vine.string().trim().nullable(),
})
