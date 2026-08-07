import { Form, Link } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'
import { LibraryGrid } from './components/library_cards'

type Movie = Data.Movie
type Serie = Data.Serie

type Props = InertiaProps & {
  query: string
  series: Serie[]
  movies: Movie[]
  seriesCount: number
  moviesCount: number
}

export default function LibraryIndex({ query, series, movies, seriesCount, moviesCount }: Props) {
  const isSearching = query.length > 0

  return (
    <div className="flex flex-col gap-8">
      <Form
        action="/app/library"
        method="get"
        options={{ preserveState: true, preserveScroll: true }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="library-query">Search your library</FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="library-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search saved movies and series"
                className="h-11 text-base"
              />
              <Button type="submit" className="h-11 sm:w-auto px-4">
                Search
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </Form>

      <LibrarySection
        title="Movies"
        entries={movies}
        count={moviesCount}
        href="/app/library/movies"
        emptyMessage={
          isSearching ? 'No movies match your search.' : 'No movies in your library yet.'
        }
      />
      <LibrarySection
        title="Series"
        entries={series}
        count={seriesCount}
        href="/app/library/series"
        emptyMessage={
          isSearching ? 'No series match your search.' : 'No series in your library yet.'
        }
      />
    </div>
  )
}

function LibrarySection({
  title,
  entries,
  count,
  href,
  emptyMessage,
}: {
  title: string
  entries: Array<Movie | Serie>
  count: number
  href: string
  emptyMessage: string
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <div className="flex items-center gap-3">
          <Link href={href} className="text-sm font-medium text-primary hover:underline">
            See more
          </Link>
          <Badge variant="outline">{count}</Badge>
        </div>
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <LibraryGrid entries={entries} />
      )}
    </section>
  )
}
