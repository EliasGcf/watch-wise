import { router } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/client'

async function refreshSeries(queryClient: ReturnType<typeof useQueryClient>) {
  router.reload({ only: ['serie'] })
  await queryClient.invalidateQueries({ queryKey: api.app.library.index.queryKey() })
}

export function useWatchSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.watch.mutationOptions({
      onSuccess: async () => {
        await refreshSeries(queryClient)
      },
    })
  )
}

export function useWatchSeasonMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.seasons.watch.mutationOptions({
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(
          api.api.library.series.seasons.episodes.queryFilter({
            params: variables.params,
          })
        )
        await refreshSeries(queryClient)
      },
    })
  )
}

export function useWatchEpisodeMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.episodes.watch.mutationOptions({
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(
          api.api.library.series.seasons.episodes.queryFilter({
            params: { id: variables.params.id, season: variables.params.season },
          })
        )
        await refreshSeries(queryClient)
      },
    })
  )
}

export function useUnwatchEpisodeMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.episodes.unwatch.mutationOptions({
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries(
          api.api.library.series.seasons.episodes.queryFilter({
            params: { id: variables.params.id, season: variables.params.season },
          })
        )
        await refreshSeries(queryClient)
      },
    })
  )
}
