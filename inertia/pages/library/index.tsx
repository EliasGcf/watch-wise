import { Form } from '@adonisjs/inertia/react'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

type MovieEntry = {
  id: number
  provider: string
  providerId: string
  type: 'movie'
  name: string
  bannerUrl: string | null
  releaseDate: string | null
  summary: string | null
  watched: boolean
}

type SeriesEntry = {
  id: number
  provider: string
  providerId: string
  type: 'series'
  name: string
  bannerUrl: string | null
  releaseDate: string | null
  summary: string | null
}

type MoviesResponse = {
  movies: MovieEntry[]
}

type SeriesResponse = {
  series: SeriesEntry[]
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
          fetch('/api/library/movies'),
          fetch('/api/library/series'),
        ])

        if (!moviesResponse.ok || !seriesResponse.ok) {
          throw new Error('Library could not be loaded.')
        }

        const moviesData = (await moviesResponse.json()) as MoviesResponse
        const seriesData = (await seriesResponse.json()) as SeriesResponse

        if (!isCurrent) return

        setMovies(moviesData.movies)
        setSeries(seriesData.series)
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
          <LibrarySection title="Movies" entries={movies} emptyMessage="No movies in your library yet." />
          <LibrarySection title="Series" entries={series} emptyMessage="No series in your library yet." />
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
}: {
  title: string
  entries: Array<MovieEntry | SeriesEntry>
  emptyMessage: string
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
            <LibraryCard key={`${entry.type}-${entry.id}`} entry={entry} />
          ))}
        </div>
      )}
    </section>
  )
}

function LibraryCard({ entry }: { entry: MovieEntry | SeriesEntry }) {
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
            {entry.releaseDate && <Badge variant="outline">{dayjs(entry.releaseDate).year()}</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {entry.summary && <p className="line-clamp-4 text-muted-foreground">{entry.summary}</p>}
        <p className="text-xs text-muted-foreground">
          {entry.provider} ID: {entry.providerId}
        </p>
        {entry.type === 'movie' && <MovieWatchedForm movie={entry} />}
      </CardContent>
    </Card>
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
