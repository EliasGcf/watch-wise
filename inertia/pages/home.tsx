import { buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{
  moviesCount: number
  seriesCount: number
}>

export default function Home({ user, moviesCount, seriesCount }: Props) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-5 px-5 py-8 sm:px-8">
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="gap-3">
          <CardDescription>Empty library</CardDescription>
          <CardTitle className="text-4xl leading-tight tracking-tight sm:text-5xl">
            Start your library
          </CardTitle>
          <p className="max-w-xl text-muted-foreground">
            Search the catalog for a movie or series, add it to your library, then track what you
            watch.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <dl className="grid grid-cols-3 gap-2 rounded-xl border bg-background/80 p-2 text-center">
            <div className="rounded-lg p-3">
              <dt className="text-xs text-muted-foreground">Watched Time</dt>
              <dd className="text-2xl font-semibold">
                {formatWatchedTime(user?.watchedTime ?? 0)}
              </dd>
            </div>
            <div className="rounded-lg p-3">
              <dt className="text-xs text-muted-foreground">Movies</dt>
              <dd className="text-2xl font-semibold">{moviesCount}</dd>
            </div>
            <div className="rounded-lg p-3">
              <dt className="text-xs text-muted-foreground">Series</dt>
              <dd className="text-2xl font-semibold">{seriesCount}</dd>
            </div>
          </dl>

          <div className="grid gap-3 sm:grid-cols-2">
            <a href="/app/catalog/search" className={buttonVariants({ className: 'w-full' })}>
              Search the catalog
            </a>
            <a
              href="/app/library"
              className={buttonVariants({ variant: 'outline', className: 'w-full' })}
            >
              View library
            </a>
          </div>
        </CardContent>
      </Card>
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
