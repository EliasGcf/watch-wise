import { router } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'
import { invalidateLibraryQueries } from './use_library_queries'

async function refreshLibrary(queryClient: ReturnType<typeof useQueryClient>) {
  await new Promise<void>((resolve) => router.reload({ onFinish: () => resolve() }))
  await invalidateLibraryQueries(queryClient)
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
