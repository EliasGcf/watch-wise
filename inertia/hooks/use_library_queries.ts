import { useQuery, type QueryClient } from '@tanstack/react-query'
import { type Data } from '@generated/data'
import { api } from '~/client'

export function useLibraryQuery(
  query: string,
  series: Data.Serie[],
  movies: Data.Movie[],
  seriesCount: number,
  moviesCount: number,
  loadedAt: number
) {
  const input = { query: query ? { q: query } : {} }
  return useQuery(
    api.api.library.index.queryOptions(input, {
      initialData: { data: { query, loadedAt, series, movies, seriesCount, moviesCount } },
      initialDataUpdatedAt: loadedAt,
      staleTime: 1_000,
      refetchOnMount: true,
    })
  )
}

export function useSeriesLibraryQuery(query: string, series: Data.Serie[], loadedAt: number) {
  const input = { query: query ? { q: query } : {} }
  return useQuery(
    api.api.library.series.index.queryOptions(input, {
      initialData: { data: { query, loadedAt, series } },
      initialDataUpdatedAt: loadedAt,
      staleTime: 1_000,
      refetchOnMount: true,
    })
  )
}

export async function invalidateLibraryQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries(api.api.library.index.queryFilter()),
    queryClient.invalidateQueries(api.api.library.series.index.queryFilter()),
  ])
}
