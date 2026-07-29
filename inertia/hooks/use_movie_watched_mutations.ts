import { router } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'

async function refreshLibrary(queryClient: ReturnType<typeof useQueryClient>) {
  router.reload({ only: ['user', 'movies'] })
  await queryClient.invalidateQueries({ queryKey: api.app.library.index.queryKey() })
}

export function useWatchMovieMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.movies.watch.mutationOptions({
      onSuccess: async () => {
        toast.success('Movie was marked as watched.')
        await refreshLibrary(queryClient)
      },
      onError: () => toast.error('Movie could not be marked as watched.'),
    })
  )
}

export function useUnwatchMovieMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.movies.unwatch.mutationOptions({
      onSuccess: async () => {
        toast.success('Movie is no longer marked as watched.')
        await refreshLibrary(queryClient)
      },
      onError: () => toast.error('Movie could not be unmarked as watched.'),
    })
  )
}
