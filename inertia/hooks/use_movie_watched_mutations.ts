import { usePage } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'
import { reload } from '~/lib/on_promise_reload'

async function refreshLibrary(
  queryClient: ReturnType<typeof useQueryClient>,
  props: string[] = []
) {
  await reload({ only: props })
  await queryClient.invalidateQueries({ queryKey: api.app.library.index.queryKey() })
}

export function useWatchMovieMutation() {
  const page = usePage()
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.movies.watch.mutationOptions({
      onSuccess: async () => {
        toast.success('Movie was marked as watched.')
        await refreshLibrary(queryClient, Object.keys(page.scrollProps ?? {}))
      },
      onError: () => toast.error('Movie could not be marked as watched.'),
    })
  )
}

export function useUnwatchMovieMutation() {
  const queryClient = useQueryClient()
  const page = usePage()

  return useMutation(
    api.api.library.movies.unwatch.mutationOptions({
      onSuccess: async () => {
        toast.success('Movie is no longer marked as watched.')
        await refreshLibrary(queryClient, Object.keys(page.scrollProps ?? {}))
      },
      onError: () => toast.error('Movie could not be unmarked as watched.'),
    })
  )
}
