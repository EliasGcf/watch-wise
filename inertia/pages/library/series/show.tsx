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
  const seriesEpisodesCount = countSeriesEpisodes(serie.catalog.seasons)
  const seriesMarked = seriesEpisodesCount > 0 && watchedEpisodes.length >= seriesEpisodesCount

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

      <Card className="overflow-hidden border-primary/20 bg-card/80 py-0">
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
                disabled={watchSeriesMutation.isPending || seriesMarked}
                onClick={() => void watchSeries()}
              >
                {watchSeriesMutation.isPending && (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                )}
                {watchSeriesMutation.isPending
                  ? 'Marking...'
                  : seriesMarked
                    ? 'All marked'
                    : 'Mark all episodes'}
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Seasons</h2>
          <p className="text-sm text-muted-foreground">
            Open a season and work through it like a watchlist.
          </p>
        </div>
        <SeasonAccordion
          serie={serie}
          seasons={serie.catalog.seasons}
          watchedEpisodes={watchedEpisodes}
          onWatched={trackWatchedEpisode}
          onBulkWatched={trackWatchedEpisodes}
          onUnwatched={untrackWatchedEpisode}
        />
      </div>
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
    <Accordion value={openSeasons} onValueChange={setOpenSeasons} className="gap-3">
      {seasons.map((season) => {
        const watchedCount = countWatchedEpisodes(watchedEpisodes, season.number)
        const progress = calculateSeasonProgress(watchedCount, season.episodesCount)

        return (
          <AccordionItem
            key={season.number}
            value={String(season.number)}
            className="rounded-xl border px-3 bg-card"
          >
            <AccordionTrigger
              disabled={season.episodesCount === 0}
              className="items-center hover:no-underline py-3"
            >
              <div className="grid w-full grid-cols-[2.5rem_1fr] items-center pr-4 sm:grid-cols-[2.5rem_1fr_3rem] sm:items-center">
                <div className="flex items-center" onClick={(event) => event.stopPropagation()}>
                  <SeasonCompleteCheckbox
                    serie={serie}
                    season={season.number}
                    watchedCount={watchedCount}
                    episodesCount={season.episodesCount}
                    watchedEpisodes={watchedEpisodes}
                    onBulkWatched={onBulkWatched}
                    onUnwatched={onUnwatched}
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="font-medium">{season.name}</span>
                    <span className="font-mono text-xs font-normal text-muted-foreground">
                      {watchedCount} / {season.episodesCount} watched
                    </span>
                    <span className="ml-auto font-mono text-xs font-normal text-muted-foreground sm:hidden">
                      {progress}%
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    aria-label={`${season.name} progress`}
                    className="mt-2 gap-0"
                  />
                </div>

                <div className="hidden items-center sm:flex sm:justify-end sm:text-right">
                  <span className="font-mono text-xs font-normal text-muted-foreground">
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

function SeasonCompleteCheckbox({
  serie,
  season,
  watchedCount,
  episodesCount,
  watchedEpisodes,
  onBulkWatched,
  onUnwatched,
}: {
  serie: Data.Serie
  season: number
  watchedCount: number
  episodesCount: number
  watchedEpisodes: WatchedEpisodeProgress[]
  onBulkWatched: (episodes: WatchedEpisodeProgress[]) => void
  onUnwatched: (episode: WatchedEpisodeProgress) => void
}) {
  const watchSeasonMutation = useWatchSeasonMutation()
  const unwatchEpisodeMutation = useUnwatchEpisodeMutation()
  const checked = episodesCount > 0 && watchedCount >= episodesCount
  const disabled = watchSeasonMutation.isPending || unwatchEpisodeMutation.isPending

  async function toggleSeasonComplete(shouldWatch: boolean) {
    if (shouldWatch) {
      const response = await watchSeasonMutation.mutateAsync({
        params: { id: serie.id, season },
      })
      onBulkWatched(response.data.watchedEpisodes ?? [])
      return
    }

    const toUnwatch = watchedEpisodes.filter((episode) => episode.season === season)
    for (const episode of toUnwatch) {
      await unwatchEpisodeMutation.mutateAsync({
        params: { id: serie.id, season: episode.season, episode: episode.episode },
      })
      onUnwatched(episode)
    }
  }

  return (
    <Checkbox
      checked={checked}
      disabled={disabled}
      aria-label={`Mark season ${season} as complete`}
      className="size-5 rounded-full"
      onCheckedChange={(value) => void toggleSeasonComplete(value)}
    />
  )
}

function countSeriesEpisodes(seasons: SeriesSeasons) {
  return seasons
    .filter((season) => season.number !== 0)
    .reduce((total, season) => total + season.episodesCount, 0)
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
  onUnwatched,
}: {
  serie: Data.Serie
  season: number
  isOpen: boolean
  watchedEpisodes: WatchedEpisodeProgress[]
  onWatched: (episode: WatchedEpisodeProgress) => void
  onUnwatched: (episode: WatchedEpisodeProgress) => void
}) {
  const episodesQuery = useSeriesEpisodesQuery({ serieId: serie.id, season, enabled: isOpen })

  if (!isOpen) return null
  if (episodesQuery.isError)
    return <p className="text-sm text-muted-foreground">Episodes could not be loaded.</p>
  if (!episodesQuery.data) return <EpisodeSkeletonList />

  const episodes = episodesQuery.data.data

  return (
    <div className="flex flex-col pb-1">
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
  )
}

function EpisodeSkeletonList() {
  return (
    <div className="flex flex-col gap-3 border-t pt-4 pb-1">
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
        'grid grid-cols-[2.5rem_1fr_auto] items-center border-t py-4 first:border-t-0 first:pt-2 last:pb-0 sm:grid-cols-[2.5rem_1fr_10rem]',
        watched && 'opacity-80'
      )}
    >
      <div className="flex items-center">
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

      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-x-4 leading-none">
          <span className="font-mono text-xs uppercase leading-none tracking-[0.18em] text-muted-foreground">
            S{episode.season}·E{episode.episode}
          </span>
          {episode.duration && (
            <span className="inline-flex items-center gap-1 font-mono text-xs leading-none text-muted-foreground">
              <Clock3 className="size-3.5" aria-hidden="true" />
              {episode.duration} min
            </span>
          )}
          {episode.isSpecial && <Badge variant="outline">Special</Badge>}
        </div>
        <h3 className="text-base font-medium tracking-tight">{episode.name}</h3>
        {episode.summary && (
          <p className="hidden text-sm text-muted-foreground sm:block sm:line-clamp-2">
            {episode.summary}
          </p>
        )}
      </div>

      <div className="flex flex-col items-end justify-center gap-1 text-sm text-muted-foreground sm:pr-3 sm:text-right">
        {!watched &&
          (episode.isReleased ? <span>Ready to watch</span> : <span>Not released yet</span>)}
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
