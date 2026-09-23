import { usePage } from '@inertiajs/react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '~/client'
import { reload } from '~/lib/on_promise_reload'

export function useAddLibraryEntryMutation() {
  const page = usePage()

  const propsKeys = Object.keys(page.props)

  return useMutation(
    api.api.library.store.mutationOptions({
      onSuccess: async () => await reload({ only: propsKeys }),
      onError: () => toast.error('Title could not be added to your library.'),
    })
  )
}
