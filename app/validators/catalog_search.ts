import vine from '@vinejs/vine'

export const indexCatalogSearchValidator = vine.create({
  q: vine.string().trim().optional(),
  page: vine.number().min(1).withoutDecimals().optional(),
  type: vine.enum(['all', 'movie', 'serie']).optional(),
})
