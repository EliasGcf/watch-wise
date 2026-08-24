import type User from '#models/user'

export async function loadLibraryListing(user: User, query: string) {
  const [series, movies, [seriesCount], [moviesCount]] = await Promise.all([
    user
      .related('series')
      .query()
      .apply((scopes) => scopes.search({ name: query }))
      .limit(6),
    user
      .related('movies')
      .query()
      .apply((scopes) => scopes.search({ name: query }))
      .preload('watched')
      .limit(6),
    user
      .related('series')
      .query()
      .apply((scopes) => scopes.search({ name: query }))
      .count('* as total'),
    user
      .related('movies')
      .query()
      .apply((scopes) => scopes.search({ name: query }))
      .count('* as total'),
  ])

  return {
    query,
    loadedAt: Date.now(),
    series,
    movies,
    seriesCount: Number(seriesCount.$extras.total),
    moviesCount: Number(moviesCount.$extras.total),
  }
}

export async function loadSeriesListing(user: User, query: string) {
  return {
    query,
    loadedAt: Date.now(),
    series: await user
      .related('series')
      .query()
      .apply((scopes) => scopes.search({ name: query })),
  }
}
