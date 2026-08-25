import { useQuery, type QueryClient } from '@tanstack/react-query'
import type { Route } from '@tuyau/core/types'
import { api } from '~/client'

export type LibraryQueryData = Route.Response<'api.library.index'>['data']
export type SeriesLibraryQueryData = Route.Response<'api.library.series.index'>['data']

export function useLibraryQuery(query: string, initialData: LibraryQueryData) {
  const input = { query: query ? { q: query } : {} }
  return useQuery(
    api.api.library.index.queryOptions(input, {
      initialData: { data: initialData },
      staleTime: 5 * 60 * 1_000,
      refetchOnMount: 'always',
    })
  )
}

export function useSeriesLibraryQuery(query: string, initialData: SeriesLibraryQueryData) {
  const input = { query: query ? { q: query } : {} }
  return useQuery(
    api.api.library.series.index.queryOptions(input, {
      initialData: { data: initialData },
      staleTime: 5 * 60 * 1_000,
      refetchOnMount: 'always',
    })
  )
}

export async function invalidateLibraryQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries(api.api.library.index.queryFilter()),
    queryClient.invalidateQueries(api.api.library.series.index.queryFilter()),
  ])
}
