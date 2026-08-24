import vine from '@vinejs/vine'

export const libraryQueryValidator = vine.create({
  q: vine.string().trim().optional(),
})
