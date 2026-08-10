import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { SearchIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'
import { ItemGrid } from '~/components/item_card'

type Props = InertiaProps & {
  query: string
  movies: Data.Movie[]
}

export default function LibraryMovies({ query, movies }: Props) {
  const isSearching = query.length > 0

  return (
    <div className="flex flex-col gap-6">
      <Form
        action="/app/library/movies"
        method="get"
        options={{ preserveState: true, preserveScroll: true }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="library-movies-query">Search movies</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="library-movies-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search saved movies"
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

      {movies.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">
              {isSearching ? 'No movies match your search.' : 'No movies in your library yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <ItemGrid items={movies.map((movie) => ({ ...movie, libraryEntry: movie }))} />
      )}
    </div>
  )
}
