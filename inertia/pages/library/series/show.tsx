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

type SeriesSeasons = Data.Serie.Variants['withCatalog']['catalog']['seasons']

type SeasonEpisode = Data.Catalog.Episode
type WatchedEpisodeProgress = { season: number; episode: number; watchedAt?: string | null }

type Props = InertiaProps<{ serie: Data.Serie.Variants['withCatalog'] }>

export default function SeriesShow({ serie }: Props) {
  const [watchedEpisodes, setWatchedEpisodes] = useState<WatchedEpisodeProgress[]>(
    serie.watchedEpisodes ?? []
  )

  function trackWatchedEpisode(episode: WatchedEpisodeProgress) {
    trackWatchedEpisodes([episode])
  }

  function trackWatchedEpisodes(episodes: WatchedEpisodeProgress[]) {
    setWatchedEpisodes((current) => {
      const next = [...current]

      for (const episode of episodes) {
        if (
          !next.some(
            (watched) => watched.season === episode.season && watched.episode === episode.episode
          )
        ) {
          next.push(episode)
        }
      }

      return next
    })
  }

  function untrackWatchedEpisode(episode: WatchedEpisodeProgress) {
    setWatchedEpisodes((current) =>
      current.filter(
        (watched) => watched.season !== episode.season || watched.episode !== episode.episode
      )
    )
  }

  async function watchSeries() {
    const response = await client.api.api.library.series.watch({ params: { id: serie.id } })
    trackWatchedEpisodes(response.data.watchedEpisodes ?? [])
  }

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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{serie.name}</CardTitle>
              <CardDescription>
                {serie.provider} ID: {serie.providerId}
              </CardDescription>
            </div>
            <Button type="button" onClick={() => void watchSeries()}>
              Mark series as watched
            </Button>
          </div>
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
          <SeasonAccordion
            serie={serie}
            seasons={serie.catalog.seasons}
            watchedEpisodes={watchedEpisodes}
            onWatched={trackWatchedEpisode}
            onBulkWatched={trackWatchedEpisodes}
            onUnwatched={untrackWatchedEpisode}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function SeasonAccordion({
  serie,
  seasons,
  watchedEpisodes,
  onWatched,
  onBulkWatched,
  onUnwatched,
}: {
  serie: Data.Serie
  seasons: SeriesSeasons
  watchedEpisodes: WatchedEpisodeProgress[]
  onWatched: (episode: WatchedEpisodeProgress) => void
  onBulkWatched: (episodes: WatchedEpisodeProgress[]) => void
  onUnwatched: (episode: WatchedEpisodeProgress) => void
}) {
  const [openSeasons, setOpenSeasons] = useState<string[]>([])

  return (
    <Accordion value={openSeasons} onValueChange={setOpenSeasons}>
      {seasons.map((season) => {
        const watchedCount = countWatchedEpisodes(watchedEpisodes, season.number)
        const progress = calculateSeasonProgress(watchedCount, season.episodesCount)

        return (
          <AccordionItem key={season.number} value={String(season.number)}>
            <AccordionTrigger>
              <div className="flex w-full flex-col gap-2 pr-4">
                <div className="flex items-center justify-between gap-3">
                  <span>{season.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {watchedCount} / {season.episodesCount} watched
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="w-9 text-right text-xs font-normal text-muted-foreground">
                    {progress}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <SeasonEpisodes
                serie={serie}
                season={season.number}
                isOpen={openSeasons.includes(String(season.number))}
                watchedEpisodes={watchedEpisodes}
                onWatched={onWatched}
                onBulkWatched={onBulkWatched}
                onUnwatched={onUnwatched}
              />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

function countWatchedEpisodes(watchedEpisodes: WatchedEpisodeProgress[], season: number) {
  return watchedEpisodes.filter((watched) => watched.season === season).length
}

function calculateSeasonProgress(watchedCount: number, episodesCount: number) {
  if (episodesCount === 0) return 0

  return Math.min(100, Math.max(0, Math.round((watchedCount / episodesCount) * 100)))
}

function SeasonEpisodes({
  serie,
  season,
  isOpen,
  watchedEpisodes,
  onWatched,
  onBulkWatched,
  onUnwatched,
}: {
  serie: Data.Serie
  season: number
  isOpen: boolean
  watchedEpisodes: WatchedEpisodeProgress[]
  onWatched: (episode: WatchedEpisodeProgress) => void
  onBulkWatched: (episodes: WatchedEpisodeProgress[]) => void
  onUnwatched: (episode: WatchedEpisodeProgress) => void
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

        if (isCurrent) setEpisodes(response.data)
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

  async function watchSeason() {
    const response = await client.api.api.library.series.seasons.watch({
      params: { id: serie.id, season },
    })
    const watchedEpisodes = response.data.watchedEpisodes ?? []

    onBulkWatched(watchedEpisodes)
    setEpisodes((current) =>
      current?.map((episode) => {
        const watchedEpisode = watchedEpisodes.find(
          (watched) => watched.season === episode.season && watched.episode === episode.episode
        )

        return watchedEpisode
          ? { ...episode, watched: { watchedAt: watchedEpisode.watchedAt ?? null } }
          : episode
      }) ?? null
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Button type="button" variant="outline" onClick={() => void watchSeason()}>
        Mark season as watched
      </Button>
      {episodes.map((episode) => (
        <EpisodeCard
          key={episode.providerId}
          serie={serie}
          episode={episode}
          watchedEpisodes={watchedEpisodes}
          onWatched={onWatched}
          onUnwatched={onUnwatched}
        />
      ))}
    </div>
  )
}

function EpisodeCard({
  serie,
  episode,
  watchedEpisodes,
  onWatched,
  onUnwatched,
}: {
  serie: Data.Serie
  episode: SeasonEpisode
  watchedEpisodes: WatchedEpisodeProgress[]
  onWatched: (episode: WatchedEpisodeProgress) => void
  onUnwatched: (episode: WatchedEpisodeProgress) => void
}) {
  const watched = watchedEpisodes.some(
    (watchedEpisode) =>
      watchedEpisode.season === episode.season && watchedEpisode.episode === episode.episode
  )
    ? {
        watchedAt:
          watchedEpisodes.find(
            (watchedEpisode) =>
              watchedEpisode.season === episode.season && watchedEpisode.episode === episode.episode
          )?.watchedAt ??
          episode.watched?.watchedAt ??
          null,
      }
    : null
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
            onUnwatched={() => {
              onUnwatched(episode)
            }}
          />
        ) : (
          <EpisodeWatchButton
            serie={serie}
            episode={currentEpisode}
            onWatched={() => {
              onWatched(episode)
            }}
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
