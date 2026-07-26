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
  const [watched, setWatched] = useState(episode.watched)
  const currentEpisode = { ...episode, watched }

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
            {watched && <Badge>Watched</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {episode.summary && <p className="text-muted-foreground">{episode.summary}</p>}
        {watched ? (
          <EpisodeUnwatchButton
            serie={serie}
            episode={currentEpisode}
            onUnwatched={() => setWatched(null)}
          />
        ) : (
          <EpisodeWatchButton
            serie={serie}
            episode={currentEpisode}
            onWatched={() => setWatched({ watchedAt: new Date().toISOString() })}
          />
        )}
      </CardContent>
    </Card>
  )
}

function EpisodeWatchButton({
  serie,
  episode,
  onWatched,
}: {
  serie: Data.Serie
  episode: SeasonEpisode
  onWatched: () => void
}) {
  if (!episode.isReleased) {
    return (
      <Button type="button" className="w-full" disabled>
        Not released yet
      </Button>
    )
  }

  async function watchEpisode() {
    await client.api.api.library.series.episodes.watch({
      params: { id: serie.id, season: episode.season, episode: episode.episode },
    })
    onWatched()
  }

  return (
    <Button
      type="button"
      className="w-full"
      aria-label={`Mark ${episode.name} as watched`}
      onClick={() => void watchEpisode()}
    >
      Mark as watched
    </Button>
  )
}

function EpisodeUnwatchButton({
  serie,
  episode,
  onUnwatched,
}: {
  serie: Data.Serie
  episode: SeasonEpisode
  onUnwatched: () => void
}) {
  async function unwatchEpisode() {
    await client.api.api.library.series.episodes.unwatch({
      params: { id: serie.id, season: episode.season, episode: episode.episode },
    })
    onUnwatched()
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      aria-label={`Unmark ${episode.name} as watched`}
      onClick={() => void unwatchEpisode()}
    >
      Unmark as watched
    </Button>
  )
}
