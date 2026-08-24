import { router } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'
import { invalidateLibraryQueries } from './use_library_queries'

export function useAddLibraryEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.store.mutationOptions({
      onSuccess: async () => {
        toast.success('Title was added to your library.')
        await new Promise<void>((resolve) => router.reload({ onFinish: () => resolve() }))
        await invalidateLibraryQueries(queryClient)
      },
      onError: () => toast.error('Title could not be added to your library.'),
    })
  )
}
