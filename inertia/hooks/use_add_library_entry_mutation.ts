import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'
import { reload } from '~/lib/on_promise_reload'

export function useAddLibraryEntryMutation() {
  return useMutation(
    api.api.library.store.mutationOptions({
      onSuccess: async () => await reload(),
      onError: () => toast.error('Title could not be added to your library.'),
    })
  )
}
