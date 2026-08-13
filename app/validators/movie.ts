import vine from '@vinejs/vine'

export const watchMovieValidator = vine.create({
  deleteFile: vine
    .boolean()
    .optional()
    .transform((value) => value ?? false),
})
