import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '~/client'
import { reload } from '~/lib/on_promise_reload'

export function useWatchSeriesMutation() {
  return useMutation(
    api.api.library.series.watch.mutationOptions({ onSuccess: async () => reload() })
  )
}

export function useWatchSeasonMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.seasons.watch.mutationOptions({
      onSuccess: async (_data, { params }) => {
        const query = api.api.library.series.seasons.episodes.queryFilter({ params })
        await Promise.all([queryClient.invalidateQueries(query), reload()])
      },
    })
  )
}

export function useWatchEpisodeMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.episodes.watch.mutationOptions({
      onSuccess: async (_data, { params }) => {
        const query = api.api.library.series.seasons.episodes.queryFilter({ params })
        await Promise.all([queryClient.invalidateQueries(query), reload()])
      },
    })
  )
}

export function useWatchBeforeMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.episodes.watchBefore.mutationOptions({
      onSuccess: async (_data, { params }) => {
        const query = api.api.library.series.seasons.episodes.queryFilter({ params })
        await Promise.all([queryClient.invalidateQueries(query), reload()])
      },
    })
  )
}

export function useUnwatchEpisodeMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.series.episodes.unwatch.mutationOptions({
      onSuccess: async (_data, { params }) => {
        const query = api.api.library.series.seasons.episodes.queryFilter({ params })
        await Promise.all([queryClient.invalidateQueries(query), reload()])
      },
    })
  )
}
