import { type ReactNode } from 'react'
import { client, queryClient } from '~/client'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { QueryClientProvider } from '@tanstack/react-query'

export function AppProviders({ children }: { children: ReactNode; withTheme?: boolean }) {
  return (
    <TuyauProvider client={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </TuyauProvider>
  )
}
