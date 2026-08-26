import { router } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { type Scroll } from '@adonisjs/inertia/types'
import { type Data } from '@generated/data'
import { InfiniteScroll } from '@inertiajs/react'
import { LoaderCircle, SearchIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { type InertiaProps } from '~/types'
import { ItemGrid } from '~/components/item_card'

type Props = InertiaProps & {
  query: string
  status: string
  movies: Scroll<Data.Movie>
}

const statusItems = [
  { value: 'all', label: 'All' },
  { value: 'watched', label: 'Watched' },
  { value: 'unwatched', label: 'Unwatched' },
]

export default function LibraryMovies({ query, status, movies }: Props) {
  const isSearching = query.length > 0

  const handleStatusChange = (value: string | null) => {
    const params: Record<string, string> = {}

    if (query) params.q = query
    if (value) params.status = value

    router.get('/app/library/movies', params, {
      only: ['query', 'status', 'movies'],
      reset: ['movies'],
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Form
        route="app.library.movies.index"
        options={{ only: ['query', 'status', 'movies'], reset: ['movies'] }}
      >
        <FieldGroup>
          <Field>
            <div className="flex items-end justify-between gap-2">
              <FieldLabel htmlFor="library-movies-query">Search movies</FieldLabel>
              <Select value={status} items={statusItems} onValueChange={handleStatusChange}>
                <SelectTrigger
                  aria-label="Filter movies by watched status"
                  className="border-none pr-0 pb-0 items-end [&_svg]:mb-0.5"
                >
                  <SelectValue className="mt-auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="watched">Watched</SelectItem>
                  <SelectItem value="unwatched">Unwatched</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="hidden" name="status" value={status} />
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

      {movies.data.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">
              {isSearching ? 'No movies match your search.' : 'No movies in your library yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <InfiniteScroll
          data="movies"
          itemsElement="#library-movies-grid"
          loading={
            <div className="flex justify-center py-4" role="status" aria-label="Loading movies">
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            </div>
          }
        >
          <ItemGrid
            id="library-movies-grid"
            items={movies.data.map((movie) => ({ ...movie, libraryEntry: movie }))}
          />
        </InfiniteScroll>
      )}
    </div>
  )
}
