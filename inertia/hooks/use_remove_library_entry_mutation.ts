import { router } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'

export function useRemoveLibraryEntryMutation() {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.destroy.mutationOptions({
      onSuccess: async () => {
        toast.success('Title was removed from your library.')
        await new Promise<void>((resolve) => router.reload({ onFinish: () => resolve() }))
        await queryClient.invalidateQueries({ queryKey: api.app.library.index.queryKey() })
      },
      onError: () => toast.error('Title could not be removed from your library.'),
    })
  )
}
