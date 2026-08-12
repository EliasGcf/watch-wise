import { Link } from '@adonisjs/inertia/react'
import { buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { type InertiaProps } from '~/types'
import { cn, formatWatchedTime } from '~/lib/utils'

type Props = InertiaProps<{
  moviesCount: number
  seriesCount: number
  recentLibraryEntries: Array<{
    id: number
    name: string
    type: 'movie' | 'serie'
    summary: string | null
  }>
}>

export default function Home({ user, moviesCount, seriesCount, recentLibraryEntries }: Props) {
  const hasLibraryEntries = recentLibraryEntries.length > 0

  return (
    <div className="flex flex-col gap-8">
      <Card className="border-primary/25 bg-linear-to-b from-card via-card to-primary/5">
        <CardHeader className="gap-4">
          <CardTitle className="max-w-2xl text-4xl leading-tight tracking-tight sm:text-6xl">
            The screen is waiting
          </CardTitle>
          <div className="flex flex-row gap-3">
            <Link
              route="app.catalog.search"
              className={buttonVariants({ className: 'flex-1 sm:flex-none sm:w-auto' })}
            >
              Search the catalog
            </Link>
            <Link
              route="app.library.index"
              className={buttonVariants({
                variant: 'outline',
                className: 'flex-1 sm:flex-none sm:w-auto',
              })}
            >
              View library
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10 sm:grid-cols-3">
            <Metric
              label="Watched Time"
              value={formatWatchedTime(user?.watchedTime ?? 0)}
              className="col-span-2 sm:col-span-1"
            />
            <Metric label="Movies" value={moviesCount} />
            <Metric label="Series" value={seriesCount} />
          </dl>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3" aria-label="Up next from your library">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Continue</p>
            <h2 className="text-2xl font-semibold tracking-tight">Up next from your library</h2>
          </div>
        </div>

        {hasLibraryEntries ? (
          <div className="grid gap-3 md:grid-cols-3">
            {recentLibraryEntries.map((entry) => (
              <Card key={entry.id} className="border-primary/10">
                <CardHeader>
                  <CardDescription>{entry.type === 'movie' ? 'Movie' : 'Series'}</CardDescription>
                  <CardTitle>{entry.name}</CardTitle>
                </CardHeader>
                {entry.summary && (
                  <CardContent>
                    <p className="line-clamp-3 text-muted-foreground">{entry.summary}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                Your library is empty. Search the catalog to add your first title.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}

function Metric({
  label,
  value,
  className,
}: {
  label: string
  value: string | number
  className?: string
}) {
  return (
    <div className={cn('bg-card p-4', className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight">{value}</dd>
    </div>
  )
}
