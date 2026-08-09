import { Link } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { buttonVariants } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
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
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {entries.map((entry) => (
        <LibraryCard key={`${entry.type}-${entry.id}`} entry={entry} />
      ))}
    </div>
  )
}

function LibraryCard({ entry }: { entry: Movie | Serie }) {
  const poster = entry.posterUrl ? (
    <img src={entry.posterUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center p-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {entry.name}
    </div>
  )

  const controls = (
    <>
      <div className="absolute left-2 top-2">
        <RemoveLibraryEntryButton entry={entry} />
      </div>
      <div className="absolute bottom-2 right-2">
        {entry.type === 'movie' && <WatchedButton movie={entry} />}
      </div>
    </>
  )

  return (
    <article className="group relative aspect-2/3 overflow-hidden rounded-xl border bg-muted">
      {entry.type === 'serie' ? (
        <Link
          href={`/app/library/series/${entry.id}`}
          className="block h-full"
          aria-label={entry.name}
        >
          {poster}
        </Link>
      ) : (
        poster
      )}
      {entry.type === 'serie' && (
        <>
          <div
            role="progressbar"
            aria-label={`${entry.name} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={entry.progress}
            className="pointer-events-none absolute bottom-0 left-0 h-1 bg-primary"
            style={{ width: `${entry.progress}%` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </>
      )}
      {controls}
    </article>
  )
}

function WatchedButton({ movie }: { movie: Movie }) {
  const watchMovie = useWatchMovieMutation()
  const unwatchMovie = useUnwatchMovieMutation()
  const isPending = watchMovie.isPending || unwatchMovie.isPending
  const watched = Boolean(movie.watched)

  function toggleWatched(checked: boolean) {
    if (checked) {
      watchMovie.mutate({ params: { id: movie.id } })
    } else {
      unwatchMovie.mutate({ params: { id: movie.id } })
    }
  }

  if (isPending) return <LoaderCircle className="animate-spin text-primary" />

  return (
    <Checkbox
      checked={watched}
      aria-label={`${watched ? 'Unmark' : 'Mark'} ${movie.name} as watched`}
      className="size-5.5 rounded-full cursor-pointer border-primary"
      onCheckedChange={(checked) => toggleWatched(Boolean(checked))}
    />
  )
}

function RemoveLibraryEntryButton({ entry }: { entry: Movie | Serie }) {
  const removeLibraryEntry = useRemoveLibraryEntryMutation()

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={buttonVariants({
          variant: 'ghost',
          size: 'icon',
          className:
            'size-8 border-transparent bg-[color-mix(in_oklch,var(--destructive)_55%,black_45%)] text-white hover:bg-[color-mix(in_oklch,var(--destructive)_40%,black_60%)]',
        })}
        aria-label={`Remove ${entry.name} from library`}
      >
        {removeLibraryEntry.isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
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
