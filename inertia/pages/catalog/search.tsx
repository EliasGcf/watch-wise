import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import dayjs from 'dayjs'
import { CheckCircle2, LoaderCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { useAddLibraryEntryMutation } from '~/hooks/use_add_library_entry_mutation'
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
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="catalog-query"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search movies and series"
                className="h-11 text-base"
              />
              <Button type="submit" className="h-11 sm:w-auto px-4">
                Search
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

      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        aria-label="Catalog search results"
      >
        {results.map((result) => (
          <CatalogResultCard key={`${result.provider}:${result.id}`} result={result} />
        ))}

        {!limitation && results.length === 0 && (
          <Card className="lg:col-span-2">
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

function CatalogResultCard({ result }: { result: Data.Catalog.SearchResult }) {
  const label = result.type === 'serie' ? 'Serie' : 'Movie'
  const addLibraryEntry = useAddLibraryEntryMutation()
  const canAddToLibrary = result.provider === 'tmdb' && !result.inLibrary

  return (
    <Card className="grid gap-0 py-0 transition-colors hover:border-primary/30 sm:grid-cols-[9rem_1fr]">
      <div className="relative aspect-[2/3] bg-muted">
        {result.posterUrl ? (
          <img src={result.posterUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
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
          {result.inLibrary ? (
            <div className="mt-auto flex w-full items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4" />
              In your library
            </div>
          ) : (
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
          )}
        </CardContent>
      </div>
    </Card>
  )
}
