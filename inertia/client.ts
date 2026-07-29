import { registry } from '@generated/registry'
import { createTuyau } from '@tuyau/core/client'
import { QueryClient } from '@tanstack/react-query'
import { createTuyauReactQueryClient } from '@tuyau/react-query'

export const client = createTuyau({
  baseUrl: '/',
  registry,
})

export const queryClient = new QueryClient()

export const api = createTuyauReactQueryClient({ client })

export const urlFor = client.urlFor
