import { usePage } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'
import { reload } from '~/lib/on_promise_reload'

export function useRemoveLibraryEntryMutation(onSuccess?: () => void | Promise<void>) {
  const queryClient = useQueryClient()
  const page = usePage()

  const propsKeys = Object.keys(page.props)

  return useMutation(
    api.api.library.destroy.mutationOptions({
      onSuccess: async () => {
        if (onSuccess) {
          await onSuccess()
        } else {
          await reload({ only: propsKeys })
        }
        await queryClient.invalidateQueries({ queryKey: api.app.library.index.queryKey() })
      },
      onError: () => toast.error('Title could not be removed from your library.'),
    })
  )
}
