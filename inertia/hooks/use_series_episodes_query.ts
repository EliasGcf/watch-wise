import { useQuery } from '@tanstack/react-query'
import { api } from '~/client'

export function useSeriesEpisodesQuery({
  serieId,
  season,
  enabled,
}: {
  serieId: number
  season: number
  enabled: boolean
}) {
  return useQuery(
    api.api.library.series.seasons.episodes.queryOptions(
      { params: { id: serieId, season } },
      { enabled }
    )
  )
}
