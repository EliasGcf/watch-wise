import { Form, Link } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { Button, buttonVariants } from '~/components/ui/button'
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
      <Link
        href="/app/library"
        className={buttonVariants({ variant: 'outline', className: 'self-start' })}
      >
        Back to library
      </Link>

      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="mb-5 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Library movies
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Movies</h1>
          <p className="mt-3 text-muted-foreground">Search the movies you have chosen to follow.</p>
        </div>

        <Form action="/app/library/movies" method="get">
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
                <Button type="submit" className="h-11 sm:w-auto">
                  Search
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </Form>
      </section>

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
