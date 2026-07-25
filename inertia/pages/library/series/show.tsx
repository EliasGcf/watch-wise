import { Form } from '@adonisjs/inertia/react'
import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { client } from '~/client'
import type { InertiaProps } from '~/types'
import { type Data } from '@generated/data'

type SeriesSeasons = Data.Serie.Variants['withSeasons']['seasons']

type SeasonEpisode = Data.Serie.Variants['forEpisodes']['episodes'][number]

export default function SeriesShow({
  serie,
}: InertiaProps<{ serie: Data.Serie.Variants['withSeasons'] }>) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <a
        href="/app/library"
        className={buttonVariants({ variant: 'outline', className: 'self-start' })}
      >
        Back to library
      </a>

      <Card>
        {serie.bannerUrl && (
          <img src={serie.bannerUrl} alt="" className="aspect-video w-full object-cover" />
        )}
        <CardHeader>
          <CardTitle>{serie.name}</CardTitle>
          <CardDescription>
            {serie.provider} ID: {serie.providerId}
          </CardDescription>
        </CardHeader>
        {serie.summary && (
          <CardContent>
            <p className="text-muted-foreground">{serie.summary}</p>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seasons</CardTitle>
          <CardDescription>Open a season to load its episodes.</CardDescription>
        </CardHeader>
        <CardContent>
          <SeasonAccordion serie={serie} seasons={serie.seasons} />
        </CardContent>
      </Card>
    </div>
  )
}

function SeasonAccordion({ serie, seasons }: { serie: Data.Serie; seasons: SeriesSeasons }) {
  const [openSeasons, setOpenSeasons] = useState<string[]>([])

  return (
    <Accordion value={openSeasons} onValueChange={setOpenSeasons}>
      {seasons.map((season) => (
        <AccordionItem key={season.season} value={String(season.season)}>
          <AccordionTrigger>{season.name}</AccordionTrigger>
          <AccordionContent>
            <SeasonEpisodes
              serie={serie}
              season={season.season}
              isOpen={openSeasons.includes(String(season.season))}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

function SeasonEpisodes({
  serie,
  season,
  isOpen,
}: {
  serie: Data.Serie
  season: number
  isOpen: boolean
}) {
  const [episodes, setEpisodes] = useState<SeasonEpisode[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || episodes || error) return

    let isCurrent = true

    async function loadEpisodes() {
      try {
        const response = await client.api.api.library.series.seasons.episodes({
          params: { id: serie.id, season },
        })

        if (isCurrent) setEpisodes(response.data.episodes)
      } catch {
        if (isCurrent) setError('Episodes could not be loaded.')
      }
    }

    void loadEpisodes()

    return () => {
      isCurrent = false
    }
  }, [episodes, error, isOpen, season, serie.id])

  if (!isOpen) return null
  if (error) return <p className="text-muted-foreground">{error}</p>
  if (!episodes) return <p className="text-muted-foreground">Loading episodes...</p>

  return (
    <div className="flex flex-col gap-3">
      {episodes.map((episode) => (
        <EpisodeCard key={episode.providerId} serie={serie} episode={episode} />
      ))}
    </div>
  )
}

function EpisodeCard({ serie, episode }: { serie: Data.Serie; episode: SeasonEpisode }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{episode.name}</CardTitle>
            <CardDescription>
              Season {episode.season}, episode {episode.episode} · {episode.duration} min
            </CardDescription>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {episode.isSpecial && <Badge variant="outline">Special</Badge>}
            {episode.watched && <Badge>Watched</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {episode.summary && <p className="text-muted-foreground">{episode.summary}</p>}
        {episode.watched ? (
          <EpisodeUnwatchForm serie={serie} episode={episode} />
        ) : (
          <EpisodeWatchForm serie={serie} episode={episode} />
        )}
      </CardContent>
    </Card>
  )
}

function EpisodeWatchForm({ serie, episode }: { serie: Data.Serie; episode: SeasonEpisode }) {
  if (!episode.isReleased) {
    return (
      <Button type="button" className="w-full" disabled>
        Not released yet
      </Button>
    )
  }

  return (
    <Form
      action={`/app/library/series/${serie.id}/seasons/${episode.season}/episodes/${episode.episode}/watch`}
      method="post"
    >
      <Button type="submit" className="w-full" aria-label={`Mark ${episode.name} as watched`}>
        Mark as watched
      </Button>
    </Form>
  )
}

function EpisodeUnwatchForm({ serie, episode }: { serie: Data.Serie; episode: SeasonEpisode }) {
  return (
    <Form
      action={`/app/library/series/${serie.id}/seasons/${episode.season}/episodes/${episode.episode}/watch`}
      method="delete"
    >
      <Button
        type="submit"
        variant="outline"
        className="w-full"
        aria-label={`Unmark ${episode.name} as watched`}
      >
        Unmark as watched
      </Button>
    </Form>
  )
}
