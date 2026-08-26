import vine from '@vinejs/vine'

export const indexSeriesValidator = vine.create({
  q: vine.string().trim().optional(),
  page: vine.number().min(1).withoutDecimals().optional(),
})
