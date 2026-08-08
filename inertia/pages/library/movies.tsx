import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'
import { LibraryGrid } from './components/library_cards'

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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="library-movies-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search saved movies"
                className="h-11 text-base"
              />
              <Button type="submit" className="h-11 sm:w-auto px-4">
                Search
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
        <LibraryGrid entries={movies} />
      )}
    </div>
  )
}
