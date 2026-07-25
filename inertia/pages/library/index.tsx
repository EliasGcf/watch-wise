import { Form } from '@adonisjs/inertia/react'
import { useEffect, useState } from 'react'
import { client } from '~/client'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

type MovieEntry = Awaited<ReturnType<typeof client.api.api.library.movies>>['data'][number]
type SeriesEntry = Awaited<ReturnType<typeof client.api.api.library.series>>['data'][number]
type SeriesEpisodes = {
  id: number
  name: string
  seasons: Array<{
    season: number
    name: string
    episodes: Array<{
      providerId: string
      season: number
      episode: number
      name: string
      releasedAt: string
      duration: number
      summary: string
      isReleased: boolean
      isSpecial: boolean
      watched: { watchedAt: string } | null
    }>
  }>
}

export default function LibraryIndex() {
  const [movies, setMovies] = useState<MovieEntry[]>([])
  const [series, setSeries] = useState<SeriesEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadLibrary() {
      setIsLoading(true)
      setError(null)

      try {
        const [moviesResponse, seriesResponse] = await Promise.all([
          client.api.api.library.movies({}),
          client.api.api.library.series({}),
        ])

        if (!isCurrent) return

        setMovies(moviesResponse.data)
        setSeries(seriesResponse.data)
      } catch {
        if (!isCurrent) return
        setError('Library could not be loaded. Try again later.')
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    void loadLibrary()

    return () => {
      isCurrent = false
    }
  }, [])

  const isEmpty = !isLoading && movies.length === 0 && series.length === 0

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Your library</CardTitle>
          <CardDescription>Movies and series you have chosen to follow.</CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Loading your library...</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && (
        <>
          <LibrarySection
            title="Movies"
            entries={movies}
            emptyMessage="No movies in your library yet."
            onRemoveEntry={(entry) =>
              setMovies((current) => current.filter((movie) => movie.id !== entry.id))
            }
          />
          <LibrarySection
            title="Series"
            entries={series}
            emptyMessage="No series in your library yet."
            onRemoveEntry={(entry) =>
              setSeries((current) => current.filter((serie) => serie.id !== entry.id))
            }
          />
        </>
      )}

      {isEmpty && (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">Your library is empty.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function LibrarySection({
  title,
  entries,
  emptyMessage,
  onRemoveEntry,
}: {
  title: string
  entries: Array<MovieEntry | SeriesEntry>
  emptyMessage: string
  onRemoveEntry: (entry: MovieEntry | SeriesEntry) => void
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Badge variant="outline">{entries.length}</Badge>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <LibraryCard
              key={`${entry.type}-${entry.id}`}
              entry={entry}
              onRemoveEntry={onRemoveEntry}
            />
          ))}
        </div>
      )}
    </section>
  )
}

function LibraryCard({
  entry,
  onRemoveEntry,
}: {
  entry: MovieEntry | SeriesEntry
  onRemoveEntry: (entry: MovieEntry | SeriesEntry) => void
}) {
  return (
    <Card>
      {entry.bannerUrl && (
        <img src={entry.bannerUrl} alt="" className="aspect-video w-full object-cover" />
      )}
      <CardHeader>
        <div className="flex flex-col gap-2">
          <CardTitle>{entry.name}</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{entry.type}</Badge>
            {entry.type === 'movie' && entry.watched && <Badge>Watched</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entry.summary && <p className="line-clamp-4 text-muted-foreground">{entry.summary}</p>}
        <p className="text-xs text-muted-foreground">
          {entry.provider} ID: {entry.providerId}
        </p>
        <RemoveLibraryEntryForm entry={entry} onRemoveEntry={onRemoveEntry} />
        {entry.type === 'movie' && <MovieWatchedForm movie={entry} />}
        {entry.type === 'serie' && <SeriesEpisodeList serie={entry} />}
      </CardContent>
    </Card>
  )
}

function SeriesEpisodeList({ serie }: { serie: SeriesEntry }) {
  const [details, setDetails] = useState<SeriesEpisodes | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCurrent = true

    async function loadEpisodes() {
      try {
        const response = await fetch(`/api/library/series/${serie.id}/episodes`)
        if (!response.ok) throw new Error('Could not load series episodes')
        const { data } = (await response.json()) as { data: SeriesEpisodes }
        if (isCurrent) setDetails(data)
      } catch {
        if (isCurrent) setError('Episodes could not be loaded.')
      }
    }

    void loadEpisodes()

    return () => {
      isCurrent = false
    }
  }, [serie.id])

  if (error) return <p className="text-sm text-muted-foreground">{error}</p>
  if (!details) return <p className="text-sm text-muted-foreground">Loading episodes...</p>

  return (
    <div className="flex flex-col gap-3">
      {details.seasons.map((season) => (
        <div key={season.season} className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">{season.name}</h3>
          {season.episodes.map((episode) => (
            <div key={episode.providerId} className="flex flex-col gap-2 rounded-md border p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{episode.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Season {episode.season}, episode {episode.episode}
                  </p>
                </div>
                {episode.isSpecial && <Badge variant="outline">Special</Badge>}
              </div>
              {episode.watched ? (
                <EpisodeUnwatchForm serie={serie} episode={episode} />
              ) : (
                <EpisodeWatchForm serie={serie} episode={episode} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function EpisodeWatchForm({
  serie,
  episode,
}: {
  serie: SeriesEntry
  episode: SeriesEpisodes['seasons'][number]['episodes'][number]
}) {
  if (!episode.isReleased) {
    return (
      <Button type="button" className="w-full" disabled>
        Not released yet
      </Button>
    )
  }

  return (
    <Form
      action={`/app/library/${serie.id}/seasons/${episode.season}/episodes/${episode.episode}/watched`}
      method="post"
    >
      <Button type="submit" className="w-full" aria-label={`Mark ${episode.name} as watched`}>
        Mark as watched
      </Button>
    </Form>
  )
}

function EpisodeUnwatchForm({
  serie,
  episode,
}: {
  serie: SeriesEntry
  episode: SeriesEpisodes['seasons'][number]['episodes'][number]
}) {
  return (
    <Form
      action={`/app/library/${serie.id}/seasons/${episode.season}/episodes/${episode.episode}/watched`}
      method="delete"
    >
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        aria-label={`Unmark ${episode.name} as watched`}
      >
        Unmark as watched
      </Button>
    </Form>
  )
}

function RemoveLibraryEntryForm({
  entry,
  onRemoveEntry,
}: {
  entry: MovieEntry | SeriesEntry
  onRemoveEntry: (entry: MovieEntry | SeriesEntry) => void
}) {
  return (
    <Form
      action={`/app/library/${entry.id}`}
      method="delete"
      onSuccess={() => onRemoveEntry(entry)}
    >
      <Button
        type="submit"
        variant="destructive"
        className="w-full"
        aria-label={`Remove ${entry.name} from library`}
      >
        Remove from library
      </Button>
    </Form>
  )
}

function MovieWatchedForm({ movie }: { movie: MovieEntry }) {
  return movie.watched ? (
    <Form action={`/app/library/${movie.id}/watched`} method="delete">
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        aria-label={`Unmark ${movie.name} as watched`}
      >
        Unmark as watched
      </Button>
    </Form>
  ) : (
    <Form action={`/app/library/${movie.id}/watched`} method="post">
      <Button type="submit" className="w-full" aria-label={`Mark ${movie.name} as watched`}>
        Mark as watched
      </Button>
    </Form>
  )
}
