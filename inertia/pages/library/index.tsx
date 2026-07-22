import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

type LibraryEntry = {
  id: number
  provider: string
  providerId: string
  type: 'movie' | 'series'
  name: string
  bannerUrl: string | null
  releaseYear: number | null
  summary: string | null
}

type Props = {
  entries: LibraryEntry[]
}

export default function LibraryIndex({ entries }: Props) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Your library</CardTitle>
          <CardDescription>Movies and series you have chosen to follow.</CardDescription>
        </CardHeader>
      </Card>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-label="Library entries"
      >
        {entries.map((entry) => (
          <Card key={entry.id}>
            {entry.bannerUrl && (
              <img src={entry.bannerUrl} alt="" className="aspect-video w-full object-cover" />
            )}
            <CardHeader>
              <div className="flex flex-col gap-2">
                <CardTitle>{entry.name}</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{entry.type}</Badge>
                  {entry.releaseYear && <Badge variant="outline">{entry.releaseYear}</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {entry.summary && (
                <p className="line-clamp-4 text-muted-foreground">{entry.summary}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {entry.provider} ID: {entry.providerId}
              </p>
            </CardContent>
          </Card>
        ))}

        {entries.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-muted-foreground">Your library is empty.</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
