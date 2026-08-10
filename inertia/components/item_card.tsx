import { Link } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { LoaderCircle, SaveIcon, Trash2 } from 'lucide-react'
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
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { useAddLibraryEntryMutation } from '~/hooks/use_add_library_entry_mutation'
import { useUnwatchMovieMutation, useWatchMovieMutation } from '~/hooks/use_movie_watched_mutations'
import { useRemoveLibraryEntryMutation } from '~/hooks/use_remove_library_entry_mutation'
import { cn } from '~/lib/utils'

type Movie = Data.Movie
type Serie = Data.Serie

type ItemCardProps = {
  name: string
  type: 'movie' | 'serie'
  posterUrl: string | null
  provider: string
  providerId: string
  libraryEntry: Movie | Serie | null
}

export function ItemGrid({ items }: { items: Array<ItemCardProps & { id: string | number }> }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <ItemCard key={item.id} {...item} />
      ))}
    </div>
  )
}

export function ItemCard({
  name,
  type,
  posterUrl,
  provider,
  providerId,
  libraryEntry,
}: ItemCardProps) {
  const label = type === 'serie' ? 'Serie' : 'Movie'

  const poster = posterUrl ? (
    <img src={posterUrl} alt="" className="h-full w-full object-cover" />
  ) : (
    <div className="flex h-full items-center justify-center p-2 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
      {name}
    </div>
  )

  return (
    <article className="group relative aspect-2/3 overflow-hidden rounded-xl border bg-muted">
      {libraryEntry?.type === 'serie' ? (
        <Link
          href={`/app/library/series/${libraryEntry.id}`}
          className="block h-full"
          aria-label={name}
        >
          {poster}
        </Link>
      ) : (
        poster
      )}

      {libraryEntry?.type === 'serie' && (
        <>
          <div
            role="progressbar"
            aria-label={`${name} progress`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={libraryEntry.progress}
            className="pointer-events-none absolute bottom-0 left-0 h-1 bg-primary"
            style={{ width: `${libraryEntry.progress}%` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        </>
      )}

      <Badge variant="ghost" className="pointer-events-none absolute bottom-0.5 left-0 sm:bottom-1">
        {label}
      </Badge>

      {libraryEntry ? (
        <>
          <div className="absolute left-1 top-1">
            <RemoveLibraryEntryButton entry={libraryEntry} />
          </div>
          {libraryEntry.type === 'movie' && (
            <div className="absolute bottom-1.5 right-1.5">
              <WatchedButton movie={libraryEntry} />
            </div>
          )}
        </>
      ) : (
        <AddToLibraryButton provider={provider} providerId={providerId} type={type} name={name} />
      )}
    </article>
  )
}

function AddToLibraryButton({
  provider,
  providerId,
  type,
  name,
}: {
  provider: string
  providerId: string
  type: 'movie' | 'serie'
  name: string
}) {
  const addLibraryEntry = useAddLibraryEntryMutation()
  const canAddToLibrary = provider === 'tmdb'

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={`Add ${name} to your library`}
      title={`Add ${name} to your library`}
      disabled={!canAddToLibrary || addLibraryEntry.isPending}
      onClick={() => {
        if (!canAddToLibrary) return

        addLibraryEntry.mutate({
          body: { provider: 'tmdb', providerId, type },
        })
      }}
      className="absolute group bottom-1 right-1 max-sm:size-7 text-primary border-primary/50 hover:scale-110"
    >
      {addLibraryEntry.isPending ? <LoaderCircle className="animate-spin" /> : <SaveIcon />}
    </Button>
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
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'max-sm:size-7 bg-[color-mix(in_oklch,var(--destructive)_55%,black_45%)] text-white hover:bg-[color-mix(in_oklch,var(--destructive)_40%,black_60%)]'
        )}
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
