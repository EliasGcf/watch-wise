import vine from '@vinejs/vine'

export const watchEpisodeValidator = vine.create({
  deleteFile: vine.boolean().optional(),
})
