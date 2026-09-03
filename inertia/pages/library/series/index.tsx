import { Form } from '@adonisjs/inertia/react'
import { type Scroll } from '@adonisjs/inertia/types'
import { type Data } from '@generated/data'
import { InfiniteScroll, router } from '@inertiajs/react'
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
  series: Scroll<Data.Serie>
}

const statusItems = [
  { value: 'all', label: 'All' },
  { value: 'watching', label: 'Watching' },
  { value: 'finished', label: 'Finished' },
  { value: 'not-started', label: 'Not started' },
]

export default function LibrarySeries({ query, status, series }: Props) {
  const isSearching = query.length > 0
  const isFiltering = status !== 'all'

  const handleStatusChange = (value: string | null) => {
    const params: Record<string, string> = {}

    if (query) params.q = query
    if (value) params.status = value

    router.get('/app/library/series', params, {
      only: ['query', 'status', 'series'],
      reset: ['series'],
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Form
        route="app.library.series.index"
        options={{ only: ['query', 'status', 'series'], reset: ['series'] }}
      >
        <FieldGroup>
          <Field>
            <div className="flex items-end justify-between gap-2">
              <FieldLabel htmlFor="library-series-query">Search series</FieldLabel>
              <Select value={status} items={statusItems} onValueChange={handleStatusChange}>
                <SelectTrigger
                  aria-label="Filter series by watched status"
                  className="h-4! border-none pr-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="watching">Watching</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="not-started">Not started</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="hidden" name="status" value={status} />
              <Input
                id="library-series-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search saved series"
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

      {series.data.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">
              {isSearching
                ? 'No series match your search.'
                : isFiltering
                  ? 'No series match this filter.'
                  : 'No series in your library yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <InfiniteScroll
            data="series"
            itemsElement="#library-series-grid"
            loading={
              <div className="flex justify-center py-4" role="status" aria-label="Loading series">
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              </div>
            }
          >
            <ItemGrid
              id="library-series-grid"
              items={series.data.map((serie) => ({ ...serie, libraryEntry: serie }))}
            />
          </InfiniteScroll>
        </div>
      )}
    </div>
  )
}
