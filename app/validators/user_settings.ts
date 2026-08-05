import vine from '@vinejs/vine'

export const updateUserSettingsValidator = vine.create({
  deleteSonarrEpisodeFiles: vine.boolean().optional(),
  deleteRadarrMovieFiles: vine.boolean().optional(),
})
