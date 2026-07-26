import { Form } from '@adonisjs/inertia/react'
import { useEffect, useState } from 'react'
import { client } from '~/client'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { type InertiaProps } from '~/types'

type MovieEntry = Awaited<ReturnType<typeof client.api.api.library.movies>>['data'][number]
type SeriesEntry = Awaited<ReturnType<typeof client.api.api.library.series>>['data'][number]

export default function LibraryIndex({ user }: InertiaProps) {
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
        {user && (
          <CardContent>
            <p className="text-2xl font-semibold">{formatWatchedTime(user.watchedTime)}</p>
            <p className="text-sm text-muted-foreground">
              Watched Time from known movie and episode runtimes.
            </p>
          </CardContent>
        )}
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

function formatWatchedTime(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${remainingMinutes}m`
  if (remainingMinutes === 0) return `${hours}h`
  return `${hours}h ${remainingMinutes}m`
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
        {entry.type === 'serie' && <SeriesDetailsLink serie={entry} />}
      </CardContent>
    </Card>
  )
}

function SeriesDetailsLink({ serie }: { serie: SeriesEntry }) {
  return (
    <a
      href={`/app/library/series/${serie.id}`}
      className={buttonVariants({ variant: 'outline', className: 'w-full' })}
    >
      View seasons
    </a>
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
  const [isWatched, setIsWatched] = useState(Boolean(movie.watched))

  async function watchMovie() {
    await client.api.api.library.movies.watch({ params: { id: movie.id } })
    setIsWatched(true)
  }

  async function unwatchMovie() {
    await client.api.api.library.movies.unwatch({ params: { id: movie.id } })
    setIsWatched(false)
  }

  return isWatched ? (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      aria-label={`Unmark ${movie.name} as watched`}
      onClick={() => void unwatchMovie()}
    >
      Unmark as watched
    </Button>
  ) : (
    <Button
      type="button"
      className="w-full"
      aria-label={`Mark ${movie.name} as watched`}
      onClick={() => void watchMovie()}
    >
      Mark as watched
    </Button>
  )
}
