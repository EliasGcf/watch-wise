import { router } from '@inertiajs/react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'

export function useAddLibraryEntryMutation() {
  return useMutation(
    api.api.library.store.mutationOptions({
      onSuccess: async () => {
        toast.success('Title was added to your library.')
        await new Promise<void>((resolve) => router.reload({ onFinish: () => resolve() }))
      },
      onError: () => toast.error('Title could not be added to your library.'),
    })
  )
}
