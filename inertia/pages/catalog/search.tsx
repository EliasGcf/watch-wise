import { Form } from '@adonisjs/inertia/react'
import dayjs from 'dayjs'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

type CatalogSearchResult = {
  provider: string
  id: string
  type: 'movie' | 'serie'
  name: string
  bannerPath: string | null
  bannerUrl: string | null
  posterPath: string | null
  posterUrl: string | null
  releasedAt: string | null
  summary: string | null
}

type Props = {
  query: string
  results: CatalogSearchResult[]
  limitation: string | null
}

export default function CatalogSearch({ query, results, limitation }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="mb-5 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Catalog</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Search titles</h1>
          <p className="mt-3 text-muted-foreground">
            Find movies and series to add to your library.
          </p>
        </div>

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
                  className="h-11 text-base"
                />
                <Button type="submit" className="h-11 sm:w-auto">
                  Search
                </Button>
              </div>
            </Field>
          </FieldGroup>
        </form>
      </section>

      {limitation && (
        <Alert>
          <AlertTitle>Catalog search is limited</AlertTitle>
          <AlertDescription>{limitation}</AlertDescription>
        </Alert>
      )}

      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        aria-label="Catalog search results"
      >
        {results.map((result) => (
          <Card
            key={`${result.provider}:${result.id}`}
            className="grid gap-0 sm:grid-cols-[12rem_1fr]"
          >
            <div className="bg-muted">
              {result.bannerUrl ? (
                <img
                  src={result.bannerUrl}
                  alt=""
                  className="aspect-video h-full w-full object-cover sm:aspect-auto"
                />
              ) : (
                <div className="flex aspect-video h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground sm:aspect-auto">
                  {result.type === 'serie' ? 'series' : result.type}
                </div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col py-4">
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
                  <p className="line-clamp-3 text-muted-foreground">{result.summary}</p>
                </CardContent>
              )}
              <CardContent className="mt-auto">
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

        {!query && !limitation && results.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent>
              <p className="text-muted-foreground">
                Search for a title to add movies and series to your library.
              </p>
            </CardContent>
          </Card>
        )}

        {query && !limitation && results.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent>
              <p className="text-muted-foreground">No movie or series titles found.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
