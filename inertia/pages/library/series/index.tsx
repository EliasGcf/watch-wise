import { Form } from '@adonisjs/inertia/react'
import { type Data } from '@generated/data'
import { SearchIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
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
      <Form
        action="/app/library/series"
        method="get"
        options={{ preserveState: true, preserveScroll: true }}
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
                className="h-11 min-w-0 flex-1 text-base"
              />
              <Button type="submit" aria-label="Search" className="size-11" size="icon">
                <SearchIcon />
              </Button>
            </div>
          </Field>
        </FieldGroup>
      </Form>

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
