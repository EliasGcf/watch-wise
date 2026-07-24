import { Form } from '@adonisjs/inertia/react'
import dayjs from 'dayjs'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

type CatalogSearchResult = {
  provider: string
  id: string
  type: 'movie' | 'serie'
  name: string
  bannerPath: string
  bannerUrl: string
  posterPath: string
  posterUrl: string
  releasedAt: string
  summary: string
}

type Props = {
  query: string
  results: CatalogSearchResult[]
  limitation: string | null
}

export default function CatalogSearch({ query, results, limitation }: Props) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Search titles</CardTitle>
          <CardDescription>Find movies and series to add to your library.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/app/catalog/search" method="get">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="catalog-query">Search the catalog</FieldLabel>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    id="catalog-query"
                    name="q"
                    type="search"
                    defaultValue={query}
                    placeholder="Search movies and series"
                  />
                  <Button type="submit" className="sm:w-auto">
                    Search
                  </Button>
                </div>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {limitation && (
        <Alert>
          <AlertTitle>Catalog search is limited</AlertTitle>
          <AlertDescription>{limitation}</AlertDescription>
        </Alert>
      )}

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Catalog search results"
      >
        {results.map((result) => (
          <Card key={`${result.provider}:${result.id}`}>
            {result.bannerUrl && (
              <img src={result.bannerUrl} alt="" className="aspect-video w-full object-cover" />
            )}
            <div className="flex min-w-0 flex-1 flex-col">
              <CardHeader>
                <div className="flex flex-col gap-2">
                  <CardTitle>{result.name}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {result.type === 'serie' ? 'series' : result.type}
                    </Badge>
                    {result.releasedAt && (
                      <Badge variant="outline">{dayjs(result.releasedAt).year()}</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              {result.summary && (
                <CardContent>
                  <p className="line-clamp-4 text-muted-foreground">{result.summary}</p>
                </CardContent>
              )}
              <CardContent>
                <Form route="app.library.store">
                  <input type="hidden" name="provider" value={result.provider} />
                  <input type="hidden" name="providerId" value={result.id} />
                  <input type="hidden" name="type" value={result.type} />
                  <Button type="submit" className="w-full">
                    Add to library
                  </Button>
                </Form>
              </CardContent>
            </div>
          </Card>
        ))}

        {query && !limitation && results.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">No movie or series titles found.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
