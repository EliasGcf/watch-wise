import { Form, Link } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { LoaderCircle } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { useUnwatchMovieMutation, useWatchMovieMutation } from '~/hooks/use_movie_watched_mutations'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { type InertiaProps } from '~/types'

type Movie = Data.Movie
type Serie = Data.Serie

type Props = InertiaProps & {
  series: Serie[]
  movies: Movie[]
}

export default function LibraryIndex({ user, series, movies }: Props) {
  const isEmpty = movies.length === 0 && series.length === 0

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-5 lg:grid-cols-[1fr_18rem]">
        <div className="flex flex-col justify-end gap-3 rounded-xl border bg-card p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your library</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Movies and series you have chosen to follow.
          </h1>
          <Link
            href="/app/catalog/search"
            className={buttonVariants({ className: 'mt-2 w-full sm:w-fit' })}
          >
            Search the catalog
          </Link>
        </div>

        {user && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardDescription>Watched Time</CardDescription>
              <CardTitle className="text-4xl">{formatWatchedTime(user.watchedTime)}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Watched Time from known movie and episode runtimes.
              </p>
            </CardContent>
          </Card>
        )}
      </section>

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
      <div className="flex items-center justify-between border-b pb-3">
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
    <Card className="grid gap-0 py-0 sm:grid-cols-[9rem_1fr]">
      <div className="bg-muted">
        {entry.posterUrl ? (
          <img
            src={entry.posterUrl}
            alt=""
            className="aspect-[2/3] h-full w-full object-cover sm:aspect-auto"
          />
        ) : (
          <div className="flex aspect-[2/3] h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground sm:aspect-auto">
            {entry.type}
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-col py-3">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-2">
            <CardTitle>{entry.name}</CardTitle>
            {entry.type === 'movie' && entry.watched && <Badge>Watched</Badge>}
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          {entry.summary && <p className="line-clamp-3 text-muted-foreground">{entry.summary}</p>}
          {entry.type === 'serie' ? (
            <div className="mt-auto flex flex-col gap-2">
              <ProviderId entry={entry} />
              <SeriesProgress serie={entry} />
            </div>
          ) : (
            <ProviderId entry={entry} className="mt-auto" />
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {entry.type === 'movie' && <MovieWatchedForm movie={entry} />}
            {entry.type === 'serie' && <SeriesDetailsLink serie={entry} />}
            <RemoveLibraryEntryForm entry={entry} />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

function ProviderId({ entry, className }: { entry: Movie | Serie; className?: string }) {
  return (
    <p className={`${className ?? ''} text-xs text-muted-foreground`}>
      {entry.provider} ID: {entry.providerId}
    </p>
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
    <Link
      href={`/app/library/series/${serie.id}`}
      className={buttonVariants({ variant: 'outline', className: 'w-full' })}
    >
      View seasons
    </Link>
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
      {unwatchMovie.isPending && <LoaderCircle className="animate-spin" />}
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
      {watchMovie.isPending && <LoaderCircle className="animate-spin" />}
      {watchMovie.isPending ? 'Marking...' : 'Mark as watched'}
    </Button>
  )
}
