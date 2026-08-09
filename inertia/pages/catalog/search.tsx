import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import dayjs from 'dayjs'
import { LoaderCircle, SaveCheck, SaveIcon, SearchIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { useAddLibraryEntryMutation } from '~/hooks/use_add_library_entry_mutation'
import { cn } from '~/lib/utils'
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
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((result) => (
              <ItemCard key={`${result.provider}:${result.id}`} result={result} />
            ))}
          </div>
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

function ItemCard({ result }: { result: Data.Catalog.SearchResult }) {
  const label = result.type === 'serie' ? 'Serie' : 'Movie'
  const year = result.releasedAt ? dayjs(result.releasedAt).year() : null

  return (
    <article className="group relative aspect-2/3 overflow-hidden rounded-xl border bg-muted">
      {result.posterUrl ? (
        <img src={result.posterUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {result.name}
        </div>
      )}

      <Badge variant="ghost" className="pointer-events-none absolute top-0.5 left-0 sm:top-1">
        {label}
      </Badge>

      {year !== null && (
        <Badge
          variant="ghost"
          className="pointer-events-none absolute bottom-0.5 left-0 sm:bottom-1"
        >
          {year}
        </Badge>
      )}

      <AddToLibraryButton result={result} name={result.name} />
    </article>
  )
}

function AddToLibraryButton({ result, name }: { result: Data.Catalog.SearchResult; name: string }) {
  const addLibraryEntry = useAddLibraryEntryMutation()
  const canAddToLibrary = result.provider === 'tmdb' && !result.inLibrary

  if (result.inLibrary) {
    return (
      <span
        className={cn(
          buttonVariants({ variant: 'outline', size: 'icon' }),
          'absolute bottom-1.5 right-1.5 pointer-events-none max-sm:size-7'
        )}
        aria-label={`${name} is in your library`}
        title={`${name} is in your library`}
      >
        <SaveCheck />
      </span>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={`Add ${name} to your library`}
      title={`Add ${name} to your library`}
      disabled={!canAddToLibrary || addLibraryEntry.isPending}
      onClick={() => {
        if (!canAddToLibrary) return

        addLibraryEntry.mutate({
          body: { provider: 'tmdb', providerId: result.id, type: result.type },
        })
      }}
      className="absolute group bottom-1.5 right-1.5 max-sm:size-7 text-primary border-primary/50 hover:scale-110"
    >
      {addLibraryEntry.isPending ? <LoaderCircle className="animate-spin" /> : <SaveIcon />}
    </Button>
  )
}
