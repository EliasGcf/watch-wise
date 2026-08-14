import { router } from '@inertiajs/react'
import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { SearchIcon } from 'lucide-react'
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
  movies: Data.Movie[]
}

export default function LibraryMovies({ query, status, movies }: Props) {
  const isSearching = query.length > 0

  const statusItems = [
    { value: 'all', label: 'All' },
    { value: 'watched', label: 'Watched' },
    { value: 'unwatched', label: 'Unwatched' },
  ]

  const handleStatusChange = (value: string | null) => {
    const params: Record<string, string> = { q: query }
    if (value && value !== 'all') params.status = value

    router.get('/app/library/movies', params, {
      preserveState: true,
      preserveScroll: true,
    })
  }

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
              <Select value={status} items={statusItems} onValueChange={handleStatusChange}>
                <SelectTrigger
                  aria-label="Filter movies by watched status"
                  className="data-[size=default]:h-11 w-30 shrink-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="watched">Watched</SelectItem>
                  <SelectItem value="unwatched">Unwatched</SelectItem>
                </SelectContent>
              </Select>
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
