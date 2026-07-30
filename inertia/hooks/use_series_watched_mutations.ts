import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/client'

async function refreshLibrary(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: api.app.library.index.queryKey() })
}

export function useWatchSeriesMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.watch.mutationOptions({
      onSuccess: async () => {
        await refreshLibrary(queryClient)
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
        await refreshLibrary(queryClient)
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
        await refreshLibrary(queryClient)
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
        await refreshLibrary(queryClient)
      },
    })
  )
}
