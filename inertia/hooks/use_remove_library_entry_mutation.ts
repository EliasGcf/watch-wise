import { router, usePage } from '@inertiajs/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'

export function useRemoveLibraryEntryMutation(onSuccess?: () => void | Promise<void>) {
  const queryClient = useQueryClient()
  const page = usePage()

  return useMutation(
    api.api.library.destroy.mutationOptions({
      onSuccess: async () => {
        toast.success('Title was removed from your library.')
        if (onSuccess) {
          await onSuccess()
        } else {
          await new Promise<void>((resolve) => {
            if (page.component === 'library/series/index') {
              const url = new URL(window.location.href)
              url.searchParams.delete('page')
              router.visit(url.toString(), {
                reset: ['series'],
                replace: true,
                onFinish: () => resolve(),
              })
            } else {
              router.reload({ onFinish: () => resolve() })
            }
          })
        }
        await queryClient.invalidateQueries({ queryKey: api.app.library.index.queryKey() })
      },
      onError: () => toast.error('Title could not be removed from your library.'),
    })
  )
}
