import { Form } from '@adonisjs/inertia/react'
import { type Scroll } from '@adonisjs/inertia/types'
import { type Data } from '@generated/data'
import { InfiniteScroll } from '@inertiajs/react'
import { LoaderCircle, SearchIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'
import { ItemGrid } from '~/components/item_card'

type Props = InertiaProps & {
  query: string
  series: Scroll<Data.Serie>
}

export default function LibrarySeries({ query, series }: Props) {
  const isSearching = query.length > 0

  return (
    <div className="flex flex-col gap-6">
      <Form
        route="app.library.series.index"
        options={{ only: ['query', 'series'], reset: ['series'] }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="library-series-query">Search series</FieldLabel>
            <div className="flex items-center gap-2">
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
              {isSearching ? 'No series match your search.' : 'No series in your library yet.'}
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
