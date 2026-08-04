import { Form } from '@adonisjs/inertia/react'
import dayjs from 'dayjs'
import { LoaderCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { useAddLibraryEntryMutation } from '~/hooks/use_add_library_entry_mutation'

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

        <Form action="/app/catalog/search" method="get">
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
        </Form>
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
          <CatalogResultCard key={`${result.provider}:${result.id}`} result={result} />
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

function CatalogResultCard({ result }: { result: CatalogSearchResult }) {
  const label = result.type === 'serie' ? 'Serie' : 'Movie'
  const addLibraryEntry = useAddLibraryEntryMutation()
  const canAddToLibrary = result.provider === 'tmdb'

  return (
    <Card className="grid gap-0 py-0 transition-colors hover:border-primary/30 sm:grid-cols-[9rem_1fr]">
      <div className="relative bg-muted">
        {result.posterUrl ? (
          <img
            src={result.posterUrl}
            alt=""
            className="aspect-[2/3] h-full w-full object-cover sm:aspect-auto"
          />
        ) : (
          <div className="flex aspect-[2/3] h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground sm:aspect-auto">
            {label}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-3 pt-10 text-xs">
          <span className="rounded-full bg-background/90 px-2 py-1 font-medium shadow-sm">
            {label}
          </span>
          {result.releasedAt && (
            <span className="rounded-full bg-background/90 px-2 py-1 font-medium shadow-sm">
              {dayjs(result.releasedAt).year()}
            </span>
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl leading-tight">{result.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          {result.summary ? (
            <p className="line-clamp-3 text-muted-foreground">{result.summary}</p>
          ) : (
            <p className="text-muted-foreground">No summary available.</p>
          )}
          <Button
            type="button"
            className="mt-auto w-full"
            disabled={!canAddToLibrary || addLibraryEntry.isPending}
            onClick={() => {
              if (!canAddToLibrary) return

              addLibraryEntry.mutate({
                body: { provider: 'tmdb', providerId: result.id, type: result.type },
              })
            }}
          >
            {addLibraryEntry.isPending && <LoaderCircle className="animate-spin" />}
            {addLibraryEntry.isPending ? 'Adding...' : 'Add to library'}
          </Button>
        </CardContent>
      </div>
    </Card>
  )
}
