import vine from '@vinejs/vine'

export const indexMoviesValidator = vine.create({
  q: vine.string().trim().optional(),
  page: vine.number().min(1).withoutDecimals().optional(),
  status: vine
    .enum(['all', 'watched', 'unwatched'])
    .optional()
    .transform((value) => value ?? 'all'),
})
