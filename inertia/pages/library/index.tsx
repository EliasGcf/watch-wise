import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { type InertiaProps } from '~/types'
import { useUnwatchMovieMutation, useWatchMovieMutation } from './use_movie_watched_mutations'

type Movie = Data.Movie
type Serie = Data.Serie

type Props = InertiaProps & {
  series: Serie[]
  movies: Movie[]
}

export default function LibraryIndex({ user, series, movies }: Props) {
  const isEmpty = movies.length === 0 && series.length === 0

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

      <LibrarySection
        title="Movies"
        entries={movies}
        emptyMessage="No movies in your library yet."
      />
      <LibrarySection
        title="Series"
        entries={series}
        emptyMessage="No series in your library yet."
      />

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
}: {
  title: string
  entries: Array<Movie | Serie>
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

function LibraryCard({ entry }: { entry: Movie | Serie }) {
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
        {entry.type === 'serie' && <SeriesProgress serie={entry} />}
        <RemoveLibraryEntryForm entry={entry} />
        {entry.type === 'movie' && <MovieWatchedForm movie={entry} />}
        {entry.type === 'serie' && <SeriesDetailsLink serie={entry} />}
      </CardContent>
    </Card>
  )
}

function SeriesProgress({ serie }: { serie: Serie }) {
  return (
    <div className="flex flex-col gap-1" aria-label={`${serie.name} progress`}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Progress</span>
        <span>{serie.progress}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-primary" style={{ width: `${serie.progress}%` }} />
      </div>
    </div>
  )
}

function SeriesDetailsLink({ serie }: { serie: Serie }) {
  return (
    <a
      href={`/app/library/series/${serie.id}`}
      className={buttonVariants({ variant: 'outline', className: 'w-full' })}
    >
      View seasons
    </a>
  )
}

function RemoveLibraryEntryForm({ entry }: { entry: Movie | Serie }) {
  return (
    <Form action={`/app/library/${entry.id}`} method="delete">
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

function MovieWatchedForm({ movie }: { movie: Movie }) {
  const watchMovie = useWatchMovieMutation()
  const unwatchMovie = useUnwatchMovieMutation()
  const isPending = watchMovie.isPending || unwatchMovie.isPending

  return movie.watched ? (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      aria-label={`Unmark ${movie.name} as watched`}
      disabled={isPending}
      onClick={() => unwatchMovie.mutate({ params: { id: movie.id } })}
    >
      {unwatchMovie.isPending ? 'Unmarking...' : 'Unmark as watched'}
    </Button>
  ) : (
    <Button
      type="button"
      className="w-full"
      aria-label={`Mark ${movie.name} as watched`}
      disabled={isPending}
      onClick={() => watchMovie.mutate({ params: { id: movie.id } })}
    >
      {watchMovie.isPending ? 'Marking...' : 'Mark as watched'}
    </Button>
  )
}
