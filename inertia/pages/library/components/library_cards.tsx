import { Link } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { LoaderCircle } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert_dialog'
import { useUnwatchMovieMutation, useWatchMovieMutation } from '~/hooks/use_movie_watched_mutations'
import { useRemoveLibraryEntryMutation } from '~/hooks/use_remove_library_entry_mutation'

type Movie = Data.Movie
type Serie = Data.Serie

export function LibraryGrid({ entries }: { entries: Array<Movie | Serie> }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {entries.map((entry) => (
        <LibraryCard key={`${entry.type}-${entry.id}`} entry={entry} />
      ))}
    </div>
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
          <CardTitle>{entry.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          {entry.summary && <p className="line-clamp-3 text-muted-foreground">{entry.summary}</p>}
          {entry.type === 'serie' ? (
            <div className="mt-auto flex flex-col gap-2">
              <ProviderId entry={entry} />
              <SeriesProgress serie={entry} />
            </div>
          ) : (
            <div className="mt-auto flex items-center justify-between gap-3">
              <ProviderId entry={entry} />
              <Badge className={entry.watched ? '' : 'invisible'}>Watched</Badge>
            </div>
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

function ProviderId({ entry }: { entry: Movie | Serie }) {
  return (
    <p className="text-xs text-muted-foreground">
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
  const removeLibraryEntry = useRemoveLibraryEntryMutation()

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={buttonVariants({ variant: 'destructive', className: 'w-full' })}
        aria-label={`Remove ${entry.name} from library`}
      >
        {removeLibraryEntry.isPending && <LoaderCircle className="animate-spin" />}
        {removeLibraryEntry.isPending ? 'Removing...' : 'Remove from library'}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from library?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {entry.name} from your library? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={removeLibraryEntry.isPending}
            onClick={() => removeLibraryEntry.mutate({ params: { id: entry.id } })}
          >
            {removeLibraryEntry.isPending && <LoaderCircle className="animate-spin" />}
            {removeLibraryEntry.isPending ? 'Removing...' : 'Remove from library'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
