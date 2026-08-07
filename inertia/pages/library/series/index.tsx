import { Form, Link } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { type InertiaProps } from '~/types'
import { LibraryGrid } from '../components/library_cards'

type Props = InertiaProps & {
  query: string
  series: Data.Serie[]
}

export default function LibrarySeries({ query, series }: Props) {
  const isSearching = query.length > 0

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/library"
        className={buttonVariants({ variant: 'outline', className: 'self-start' })}
      >
        Back to library
      </Link>

      <section className="rounded-xl border bg-card p-5 sm:p-6">
        <div className="mb-5 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Library series
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Series</h1>
          <p className="mt-3 text-muted-foreground">Search the series you have chosen to follow.</p>
        </div>

        <Form
          action="/app/library/series"
          method="get"
          options={{ preserveState: true, preserveScroll: true }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="library-series-query">Search series</FieldLabel>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  id="library-series-query"
                  name="q"
                  type="search"
                  defaultValue={query}
                  placeholder="Search saved series"
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

      {series.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-muted-foreground">
              {isSearching ? 'No series match your search.' : 'No series in your library yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <LibraryGrid entries={series} />
      )}
    </div>
  )
}
