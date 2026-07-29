import { type ReactNode } from 'react'
import { client, queryClient } from '~/client'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '~/components/theme-provider'

export function AppProviders({ children, withTheme = true }: { children: ReactNode; withTheme?: boolean }) {
  const content = withTheme ? <ThemeProvider defaultTheme="light">{children}</ThemeProvider> : children

  return (
    <TuyauProvider client={client}>
      <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>
    </TuyauProvider>
  )
}
