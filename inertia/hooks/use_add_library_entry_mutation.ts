import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'

export function useAddLibraryEntryMutation() {
  return useMutation(
    api.api.library.store.mutationOptions({
      onSuccess: () => toast.success('Title was added to your library.'),
      onError: () => toast.error('Title could not be added to your library.'),
    })
  )
}
