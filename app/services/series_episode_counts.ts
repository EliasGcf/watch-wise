import Serie from '#models/serie'
import { catalog } from '#services/catalog_provider'

export async function loadSeriesEpisodeCounts(series: Serie | Serie[]) {
  const seriesList = Array.isArray(series) ? series : [series]

  await Promise.all(
    seriesList.map(async (serie) => {
      const catalogSerie = await catalog.findSerieById(serie.providerId)

      if (!catalogSerie) {
        throw new Error(`Serie with providerId "${serie.providerId}" not found in catalog.`)
      }

      serie.$extras.episodesCount = catalogSerie.episodesCount
      serie.$extras.watchedEpisodesCount = serie.watchedEpisodes.length
    })
  )
}
