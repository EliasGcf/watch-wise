import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'
import { reload } from '~/lib/on_promise_reload'

export function useRemoveLibraryEntryMutation(onSuccess?: () => void | Promise<void>) {
  const queryClient = useQueryClient()

  return useMutation(
    api.api.library.destroy.mutationOptions({
      onSuccess: async () => {
        toast.success('Title was removed from your library.')
        if (onSuccess) {
          await onSuccess()
        } else {
          await reload()
        }
        await queryClient.invalidateQueries({ queryKey: api.app.library.index.queryKey() })
      },
      onError: () => toast.error('Title could not be removed from your library.'),
    })
  )
}
