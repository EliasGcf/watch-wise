import { Link } from '@adonisjs/inertia/react'
import { useState } from 'react'
import { Clock3, LoaderCircle } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import { Progress, ProgressLabel, ProgressValue } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import { useSeriesEpisodesQuery } from '~/hooks/use_series_episodes_query'
import {
  useUnwatchEpisodeMutation,
  useWatchEpisodeMutation,
  useWatchSeasonMutation,
  useWatchSeriesMutation,
} from '~/hooks/use_series_watched_mutations'
import { cn } from '~/lib/utils'
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
        <div key={item} className="grid gap-3 border-t py-4 sm:grid-cols-[2.5rem_1fr_10rem]">
          <Skeleton className="mx-auto size-5" />
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
  const watchedAt = watchedEpisode?.watchedAt ?? episode.watched?.watchedAt ?? null
  const watched = watchedEpisode ? { watchedAt } : null
  const watchEpisodeMutation = useWatchEpisodeMutation()
  const unwatchEpisodeMutation = useUnwatchEpisodeMutation()
  const isPending = watchEpisodeMutation.isPending || unwatchEpisodeMutation.isPending

  async function toggleWatched(checked: boolean) {
    if (checked) {
      await watchEpisodeMutation.mutateAsync({
        params: { id: serie.id, season: episode.season, episode: episode.episode },
      })
      onWatched(episode)
      return
    }

    await unwatchEpisodeMutation.mutateAsync({
      params: { id: serie.id, season: episode.season, episode: episode.episode },
    })
    onUnwatched(episode)
  }

  return (
    <article
      className={cn(
        'grid gap-3 border-t py-4 first:border-t-0 sm:grid-cols-[2.5rem_1fr_10rem] sm:items-center',
        watched && 'bg-primary/5 opacity-70'
      )}
    >
      <div className="flex h-full items-center sm:justify-center">
        {isPending ? (
          <LoaderCircle className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
        ) : (
          <Checkbox
            checked={Boolean(watched)}
            disabled={!episode.isReleased}
            aria-label={
              watched ? `Unmark ${episode.name} as watched` : `Mark ${episode.name} as watched`
            }
            className="size-5 rounded-full"
            onCheckedChange={(checked) => void toggleWatched(checked)}
          />
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 leading-none">
          <p className="font-mono text-xs uppercase leading-none tracking-[0.18em] text-muted-foreground">
            S{episode.season} · E{episode.episode}
          </p>
          {episode.duration && (
            <span className="inline-flex items-center gap-1 font-mono text-xs leading-none text-muted-foreground">
              <Clock3 className="size-3 shrink-0" aria-hidden="true" />
              {episode.duration} min
            </span>
          )}
          {episode.isSpecial && <Badge variant="outline">Special</Badge>}
        </div>
        <h3 className="mt-1 text-base font-medium tracking-tight">{episode.name}</h3>
        {episode.summary && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{episode.summary}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground sm:flex-col sm:items-end sm:pr-3 sm:text-right">
        {watched ? (
          <Badge>Watched</Badge>
        ) : episode.isReleased ? (
          <span>Ready to watch</span>
        ) : (
          <span>Not released yet</span>
        )}
        {watchedAt && <span className="font-mono text-xs">{formatWatchedAt(watchedAt)}</span>}
      </div>
    </article>
  )
}

function formatWatchedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(value)
  )
}
