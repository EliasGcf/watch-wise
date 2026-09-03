export type SerieStatus = 'watching' | 'finished' | 'not-started'

export function matchesSerieStatus(watched: number, released: number, status: SerieStatus) {
  const finished = released > 0 && watched >= released

  if (status === 'not-started') return watched === 0
  if (status === 'finished') return finished
  return watched > 0 && !finished
}

export function calculateSerieProgress(watched: number, released: number) {
  if (released === 0) return 0

  return Math.min(100, Math.max(0, (watched / released) * 100))
}
