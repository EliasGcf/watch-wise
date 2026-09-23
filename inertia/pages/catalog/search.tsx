import { Form } from '@adonisjs/inertia/react'
import { type Scroll } from '@adonisjs/inertia/types'
import { type Data } from '@generated/data'
import { InfiniteScroll, router } from '@inertiajs/react'
import { LoaderCircle, SearchIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { ItemGrid } from '~/components/item_card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { type InertiaProps } from '~/types'

type Props = InertiaProps & {
  query?: string
  type: CatalogSearchType
  results: Scroll<Data.Catalog.SearchResult>
  limitation: string | null
}

type CatalogSearchType = 'all' | 'movie' | 'serie'

const typeItems = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'serie', label: 'Series' },
]

export default function CatalogSearch({ query, type, results, limitation }: Props) {
  const handleTypeChange = (value: string | null) => {
    const params: Record<string, string> = {}

    if (query) params.q = query
    if (value) params.type = value

    router.get('/app/catalog/search', params, {
      only: ['query', 'type', 'results', 'limitation'],
      reset: ['results'],
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Form
        route="app.catalog.search"
        options={{
          preserveState: true,
          preserveScroll: true,
          only: ['query', 'results', 'limitation'],
          reset: ['results'],
        }}
      >
        <FieldGroup>
          <Field>
            <div className="flex items-end justify-between gap-2">
              <FieldLabel htmlFor="catalog-query">Search the catalog</FieldLabel>
              <Select value={type} items={typeItems} onValueChange={handleTypeChange}>
                <SelectTrigger
                  aria-label="Filter catalog by type"
                  className="h-4! border-none pr-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input type="hidden" name="type" value={type} />
              <Input
                id="catalog-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search movies and series"
                className="h-11 min-w-0 flex-1"
              />
              <Button type="submit" aria-label="Search" className="size-11 sm:w-fit px-3">
                <SearchIcon className="size-4.5" />
                <span className="sr-only sm:not-sr-only">Search</span>
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </Form>

      {limitation && (
        <Alert>
          <AlertTitle>Catalog search is limited</AlertTitle>
          <AlertDescription>{limitation}</AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-4" aria-label="Catalog search results">
        {results.data.length > 0 && (
          <InfiniteScroll
            data="results"
            itemsElement="#catalog-search-grid"
            loading={
              <div className="flex justify-center py-4" role="status" aria-label="Loading results">
                <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              </div>
            }
          >
            <ItemGrid
              id="catalog-search-grid"
              items={results.data.map((result) => ({
                showType: true,
                ...result,
                providerId: result.id,
                libraryEntry: result.inLibrary,
              }))}
            />
          </InfiniteScroll>
        )}

        {!limitation && results.data.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                {query
                  ? 'No movie or series titles found.'
                  : 'Search for a title to add movies and series to your library.'}
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
