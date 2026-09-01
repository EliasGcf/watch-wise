import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { SearchIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { ItemGrid } from '~/components/item_card'
import { type InertiaProps } from '~/types'

type Props = InertiaProps & {
  query: string
  results: Data.Catalog.SearchResult[]
  limitation: string | null
}

export default function CatalogSearch({ query, results, limitation }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <Form
        action="/app/catalog/search"
        method="get"
        options={{ preserveState: true, preserveScroll: true }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="catalog-query">Search the catalog</FieldLabel>
            <div className="flex items-center gap-2">
              <Input
                id="catalog-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search movies and series"
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

      {limitation && (
        <Alert>
          <AlertTitle>Catalog search is limited</AlertTitle>
          <AlertDescription>{limitation}</AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-4" aria-label="Catalog search results">
        {results.length > 0 && (
          <ItemGrid
            items={results.map((result) => ({
              showType: true,
              ...result,
              providerId: result.id,
              libraryEntry: result.inLibrary,
            }))}
          />
        )}

        {!limitation && results.length === 0 && (
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
