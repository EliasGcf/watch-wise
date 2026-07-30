import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { CheckCircle2, Circle, Clock3, LoaderCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress, ProgressLabel, ProgressValue } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import { useSeriesEpisodesQuery } from '~/hooks/use_series_episodes_query'
import {
  useUnwatchEpisodeMutation,
  useWatchEpisodeMutation,
  useWatchSeasonMutation,
  useWatchSeriesMutation,
} from '~/hooks/use_series_watched_mutations'
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
  const watchSeriesMutation = useWatchSeriesMutation()

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
    const response = await watchSeriesMutation.mutateAsync({ params: { id: serie.id } })
    trackWatchedEpisodes(response.data.watchedEpisodes ?? [])
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/app/library"
        className={buttonVariants({ variant: 'outline', className: 'self-start' })}
      >
        Back to library
      </Link>

      <Card className="overflow-hidden border-primary/20 bg-card/80">
        <div className="grid lg:grid-cols-[1.15fr_1fr]">
          {serie.bannerUrl && (
            <div className="relative min-h-64 bg-muted">
              <img src={serie.bannerUrl} alt="" className="h-full w-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-linear-to-t from-background/70 to-transparent" />
            </div>
          )}
          <div className="flex flex-col justify-center gap-4 py-5">
            <CardHeader>
              <CardDescription className="font-mono text-xs uppercase tracking-[0.22em]">
                {serie.provider} ID: {serie.providerId}
              </CardDescription>
              <CardTitle className="max-w-xl text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">
                {serie.name}
              </CardTitle>
            </CardHeader>
            {serie.summary && (
              <CardContent>
                <p className="max-w-2xl text-muted-foreground">{serie.summary}</p>
              </CardContent>
            )}
            <CardContent className="flex flex-col gap-4">
              <SeriesProgress value={serie.progress} />
              <Button
                type="button"
                className="w-full sm:w-fit"
                disabled={watchSeriesMutation.isPending}
                onClick={() => void watchSeries()}
              >
                {watchSeriesMutation.isPending && (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                )}
                {watchSeriesMutation.isPending ? 'Marking series...' : 'Mark released episodes'}
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seasons</CardTitle>
          <CardDescription>Open a season and work through it like a watchlist.</CardDescription>
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

function SeriesProgress({ value }: { value: number }) {
  return (
    <Progress value={value} aria-label="Series progress" className="gap-2">
      <ProgressLabel className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Series progress
      </ProgressLabel>
      <ProgressValue className="font-mono text-xs text-muted-foreground">
        {() => `${value}%`}
      </ProgressValue>
    </Progress>
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
                  <span className="font-mono text-xs font-normal text-muted-foreground">
                    {watchedCount} / {season.episodesCount} watched
                  </span>
                </div>
                <Progress value={progress} aria-label={`${season.name} progress`}>
                  <ProgressValue className="font-mono text-xs font-normal text-muted-foreground">
                    {() => `${progress}%`}
                  </ProgressValue>
                </Progress>
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
  const episodesQuery = useSeriesEpisodesQuery({ serieId: serie.id, season, enabled: isOpen })
  const watchSeasonMutation = useWatchSeasonMutation()

  if (!isOpen) return null
  if (episodesQuery.isError)
    return <p className="text-sm text-muted-foreground">Episodes could not be loaded.</p>
  if (!episodesQuery.data) return <EpisodeSkeletonList />

  async function watchSeason() {
    const response = await watchSeasonMutation.mutateAsync({ params: { id: serie.id, season } })
    onBulkWatched(response.data.watchedEpisodes ?? [])
  }

  const episodes = episodesQuery.data.data

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-muted/20 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Season tape
          </p>
          <p className="text-sm text-muted-foreground">
            Mark episodes from the line, then keep watching where it breaks.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-fit"
          disabled={watchSeasonMutation.isPending}
          onClick={() => void watchSeason()}
        >
          {watchSeasonMutation.isPending && (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          )}
          {watchSeasonMutation.isPending ? 'Marking season...' : 'Mark released season'}
        </Button>
      </div>

      <div className="flex flex-col">
        {episodes.map((episode) => (
          <EpisodeRow
            key={episode.providerId}
            serie={serie}
            episode={episode}
            watchedEpisodes={watchedEpisodes}
            onWatched={onWatched}
            onUnwatched={onUnwatched}
          />
        ))}
      </div>
    </div>
  )
}

function EpisodeSkeletonList() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <Skeleton className="h-8 w-36" />
      </div>
      {[1, 2, 3].map((item) => (
        <div key={item} className="grid gap-3 border-t py-4 sm:grid-cols-[2rem_1fr_auto]">
          <Skeleton className="size-6 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-64 max-w-full" />
          </div>
          <Skeleton className="h-8 w-28" />
        </div>
      ))}
    </div>
  )
}

function EpisodeRow({
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
  const watchedEpisode = watchedEpisodes.find(
    (watched) => watched.season === episode.season && watched.episode === episode.episode
  )
  const watched = watchedEpisode
    ? {
        watchedAt: watchedEpisode.watchedAt ?? episode.watched?.watchedAt ?? null,
      }
    : null
  const currentEpisode = { ...episode, watched }

  return (
    <article className="grid gap-3 border-t py-4 first:border-t-0 sm:grid-cols-[2rem_1fr_auto] sm:items-start">
      <div className="flex items-center gap-3 sm:block">
        <span
          className={
            watched
              ? 'flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground'
              : 'flex size-7 items-center justify-center rounded-full border bg-background text-muted-foreground'
          }
          aria-hidden="true"
        >
          {watched ? <CheckCircle2 /> : <Circle />}
        </span>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground sm:hidden">
          S{episode.season} E{episode.episode}
        </p>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="hidden font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground sm:block">
            S{episode.season} E{episode.episode}
          </p>
          {episode.duration && (
            <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
              <Clock3 aria-hidden="true" />
              {episode.duration} min
            </span>
          )}
          {episode.isSpecial && <Badge variant="outline">Special</Badge>}
          {watched && <Badge>Watched</Badge>}
        </div>
        <h3 className="mt-1 text-base font-medium tracking-tight">{episode.name}</h3>
        {episode.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{episode.summary}</p>
        )}
      </div>

      <div className="sm:justify-self-end">
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
      </div>
    </article>
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
  const watchEpisodeMutation = useWatchEpisodeMutation()

  if (!episode.isReleased) {
    return (
      <Button type="button" className="w-full" disabled>
        Not released yet
      </Button>
    )
  }

  async function watchEpisode() {
    await watchEpisodeMutation.mutateAsync({
      params: { id: serie.id, season: episode.season, episode: episode.episode },
    })
    onWatched()
  }

  return (
    <Button
      type="button"
      size="sm"
      className="w-full sm:w-fit"
      aria-label={`Mark ${episode.name} as watched`}
      aria-pressed="false"
      disabled={watchEpisodeMutation.isPending}
      onClick={() => void watchEpisode()}
    >
      {watchEpisodeMutation.isPending && (
        <LoaderCircle data-icon="inline-start" className="animate-spin" />
      )}
      {watchEpisodeMutation.isPending ? 'Marking...' : 'Mark watched'}
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
  const unwatchEpisodeMutation = useUnwatchEpisodeMutation()

  async function unwatchEpisode() {
    await unwatchEpisodeMutation.mutateAsync({
      params: { id: serie.id, season: episode.season, episode: episode.episode },
    })
    onUnwatched()
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full sm:w-fit"
      aria-label={`Unmark ${episode.name} as watched`}
      aria-pressed="true"
      disabled={unwatchEpisodeMutation.isPending}
      onClick={() => void unwatchEpisode()}
    >
      {unwatchEpisodeMutation.isPending && (
        <LoaderCircle data-icon="inline-start" className="animate-spin" />
      )}
      {unwatchEpisodeMutation.isPending ? 'Unmarking...' : 'Watched'}
    </Button>
  )
}
