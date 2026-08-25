import { Form, Link, type LinkProps } from '@adonisjs/inertia/react'
import { SearchIcon } from 'lucide-react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'
import { ItemGrid } from '~/components/item_card'
import { useLibraryQuery, type LibraryQueryData } from '~/hooks/use_library_queries'

type Props = InertiaProps<{ query: string; initialData: LibraryQueryData }>

export default function LibraryIndex({ query, initialData }: Props) {
  const { data } = useLibraryQuery(query, initialData).data
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
            <div className="flex items-center gap-2">
              <Input
                id="library-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search saved movies and series"
                className="h-11 min-w-0 flex-1"
              />
              <Button type="submit" aria-label="Search" className="size-11 sm:w-fit">
                <SearchIcon className="size-4.5" />
                <span className="sr-only sm:not-sr-only">Search</span>
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </Form>

      <LibrarySection
        title="Movies"
        entries={data.movies}
        count={data.moviesCount}
        route="app.library.movies.index"
        emptyMessage={
          isSearching ? 'No movies match your search.' : 'No movies in your library yet.'
        }
      />
      <LibrarySection
        title="Series"
        entries={data.series}
        count={data.seriesCount}
        route="app.library.series.index"
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
  route,
  emptyMessage,
}: {
  title: string
  entries: Array<LibraryQueryData['movies'][number] | LibraryQueryData['series'][number]>
  count: number
  route: NonNullable<LinkProps['route']>
  emptyMessage: string
}) {
  return (
    <section className="flex flex-col gap-3" aria-label={title}>
      <div className="flex items-center justify-between border-b pb-3">
        <h2 className="text-2xl font-semibold tracking-tight">
          <Link route={route} className="hover:underline">
            {title}
          </Link>
        </h2>
        <div className="flex items-center gap-3">
          <Link route={route} className="text-sm font-medium text-primary hover:underline">
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
        <ItemGrid items={entries.map((entry) => ({ ...entry, libraryEntry: entry }))} />
      )}
    </section>
  )
}
