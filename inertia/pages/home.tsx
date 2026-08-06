import { Link } from '@adonisjs/inertia/react'
import { buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { type InertiaProps } from '~/types'
import { formatWatchedTime } from '~/lib/utils'

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
      <section className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
        <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
          <CardHeader className="gap-4">
            <CardDescription>
              {hasLibraryEntries ? 'Library summary' : 'Empty library'}
            </CardDescription>
            <p className="text-sm font-medium text-muted-foreground">
              {hasLibraryEntries ? 'Your library' : 'Start your library'}
            </p>
            <CardTitle className="max-w-2xl text-4xl leading-tight tracking-tight sm:text-6xl">
              {hasLibraryEntries ? 'Your watch desk is open.' : 'Start your library.'}
            </CardTitle>
            <p className="max-w-xl text-muted-foreground">
              {hasLibraryEntries
                ? 'Keep going with movies and series already in your library.'
                : 'Search the catalog for a movie or series, add it to your library, then track what you watch.'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app/catalog/search"
                className={buttonVariants({ className: 'w-full sm:w-auto' })}
              >
                Search the catalog
              </Link>
              <Link
                href="/app/library"
                className={buttonVariants({ variant: 'outline', className: 'w-full sm:w-auto' })}
              >
                View library
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>At a glance</CardTitle>
            <CardDescription>Known runtime and saved titles.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3">
              <Metric label="Watched Time" value={formatWatchedTime(user?.watchedTime ?? 0)} />
              <Metric label="Movies" value={moviesCount} />
              <Metric label="Series" value={seriesCount} />
            </dl>
          </CardContent>
        </Card>
      </section>

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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border bg-background/40 p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight">{value}</dd>
    </div>
  )
}
