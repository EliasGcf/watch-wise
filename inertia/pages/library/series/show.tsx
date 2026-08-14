import { router } from '@inertiajs/react'
import { useRef, useState } from 'react'
import {
  ArrowLeft,
  Calendar,
  CalendarCheck2,
  CalendarClock,
  Clock3,
  LoaderCircle,
  Trash2,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert_dialog'
import { useRemoveLibraryEntryMutation } from '~/hooks/use_remove_library_entry_mutation'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion'
import { Badge } from '~/components/ui/badge'
import { Button, buttonVariants } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Checkbox } from '~/components/ui/checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/components/ui/context_menu'
import { Progress, ProgressLabel, ProgressValue } from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import { useSeriesEpisodesQuery } from '~/hooks/use_series_episodes_query'
import { useUserSettingsQuery } from '~/hooks/use_user_settings_query'
import {
  useUnwatchEpisodeMutation,
  useWatchBeforeMutation,
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
  const watchSeriesMutation = useWatchSeriesMutation()
  const seriesEpisodesCount = countSeriesEpisodes(serie.catalog.seasons)
  const seriesMarked =
    seriesEpisodesCount > 0 && (serie.watchedEpisodes ?? []).length >= seriesEpisodesCount

  async function watchSeries() {
    await watchSeriesMutation.mutateAsync({ params: { id: serie.id } })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="-mx-5 sm:-mx-8 -mt-5 lg:-mt-6">
        {serie.bannerUrl ? (
          <article className="relative min-h-72 overflow-hidden sm:min-h-96 ">
            <img
              src={serie.bannerUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
            <div className="absolute inset-0 bg-linear-to-b from-background via-transparent to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-background via-transparent to-background" />
            <div className="relative flex h-full min-h-72 flex-col gap-5 px-5 pt-5 pb-8 sm:min-h-96 sm:px-8 sm:pb-10">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="self-start rounded-lg bg-card text-foreground"
                onClick={() => window.history.back()}
              >
                <ArrowLeft data-icon="inline-start" className="size-4" />
                Back to library
              </Button>
              <CardHeader className="mt-auto sm:max-w-2xl">
                <CardTitle className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-6xl">
                  {serie.name}
                </CardTitle>
              </CardHeader>
              {serie.summary && <p className="max-w-2xl text-muted-foreground">{serie.summary}</p>}
            </div>
          </article>
        ) : (
          <Card className="py-0">
            <div className="flex flex-col gap-6 px-5 pt-3 pb-6 sm:px-8">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="self-start rounded-lg bg-muted/60 text-muted-foreground hover:text-foreground"
                onClick={() => window.history.back()}
              >
                <ArrowLeft data-icon="inline-start" className="size-4" />
                Back to library
              </Button>
              <CardHeader>
                <CardTitle className="max-w-xl text-4xl font-semibold tracking-[-0.06em] text-balance sm:text-6xl">
                  {serie.name}
                </CardTitle>
              </CardHeader>
              {serie.summary && (
                <CardContent>
                  <p className="max-w-2xl text-muted-foreground">{serie.summary}</p>
                </CardContent>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <SeriesProgress value={serie.progress} inProduction={serie.inProduction} />
        </div>
        <div className="flex w-full flex-row gap-2 sm:w-fit">
          <Button
            type="button"
            className="flex-1 sm:flex-none"
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
          <RemoveEntryButton serie={serie} />
        </div>
      </div>

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
          watchedEpisodes={serie.watchedEpisodes ?? []}
        />
      </div>
    </div>
  )
}

function SeriesProgress({ value, inProduction }: { value: number; inProduction?: boolean }) {
  return (
    <Progress
      value={value}
      aria-label="Series progress"
      className="gap-2"
      indicatorClassName={inProduction === false ? 'bg-violet-600' : undefined}
    >
      <ProgressLabel className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Series progress
      </ProgressLabel>
      <ProgressValue className="font-mono text-xs text-muted-foreground">
        {() => `${value}%`}
      </ProgressValue>
    </Progress>
  )
}

function RemoveEntryButton({ serie }: { serie: Data.Serie }) {
  const removeLibraryEntry = useRemoveLibraryEntryMutation(() => {
    router.visit('/app/library')
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger
        className={buttonVariants({ variant: 'destructive', size: 'icon' })}
        aria-label={`Remove ${serie.name} from library`}
      >
        <Trash2 />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from library?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove {serie.name} from your library? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={removeLibraryEntry.isPending}
            onClick={() => removeLibraryEntry.mutate({ params: { id: serie.id } })}
          >
            {removeLibraryEntry.isPending && <LoaderCircle className="animate-spin" />}
            {removeLibraryEntry.isPending ? 'Removing...' : 'Remove from library'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function SeasonAccordion({
  serie,
  seasons,
  watchedEpisodes,
}: {
  serie: Data.Serie
  seasons: SeriesSeasons
  watchedEpisodes: WatchedEpisodeProgress[]
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
              <div className="grid w-full grid-cols-[2.5rem_1fr] items-center pr-4">
                <div className="flex items-center" onClick={(event) => event.stopPropagation()}>
                  <SeasonCompleteCheckbox
                    serie={serie}
                    season={season.number}
                    watchedCount={watchedCount}
                    episodesCount={season.episodesCount}
                    watchedEpisodes={watchedEpisodes}
                  />
                </div>
                <div className="grid min-w-0 grid-cols-[auto_1fr_auto] items-center gap-x-3">
                  <div className="flex items-center gap-x-3">
                    <span className="font-medium">{season.name}</span>
                    <span className="font-mono text-xs font-normal text-muted-foreground">
                      {watchedCount} / {season.episodesCount}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <Progress
                      value={progress}
                      aria-label={`${season.name} progress`}
                      className="gap-0"
                    />
                  </div>
                  <span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    {progress}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <SeasonEpisodes
                serie={serie}
                seasons={seasons}
                season={season.number}
                isOpen={openSeasons.includes(String(season.number))}
                watchedEpisodes={watchedEpisodes}
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
}: {
  serie: Data.Serie
  season: number
  watchedCount: number
  episodesCount: number
  watchedEpisodes: WatchedEpisodeProgress[]
}) {
  const watchSeasonMutation = useWatchSeasonMutation()
  const unwatchEpisodeMutation = useUnwatchEpisodeMutation()
  const checked = episodesCount > 0 && watchedCount >= episodesCount
  const disabled = watchSeasonMutation.isPending || unwatchEpisodeMutation.isPending

  async function toggleSeasonComplete(shouldWatch: boolean) {
    if (shouldWatch) {
      await watchSeasonMutation.mutateAsync({
        params: { id: serie.id, season },
      })
      return
    }

    const toUnwatch = watchedEpisodes.filter((episode) => episode.season === season)
    for (const episode of toUnwatch) {
      await unwatchEpisodeMutation.mutateAsync({
        params: { id: serie.id, season: episode.season, episode: episode.episode },
      })
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
  seasons,
  season,
  isOpen,
  watchedEpisodes,
}: {
  serie: Data.Serie
  seasons: SeriesSeasons
  season: number
  isOpen: boolean
  watchedEpisodes: WatchedEpisodeProgress[]
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
          seasons={seasons}
          episode={episode}
          watchedEpisodes={watchedEpisodes}
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

function previousRegularEpisode(
  episode: SeasonEpisode,
  seasons: SeriesSeasons
): { season: number; episode: number } | null {
  if (episode.episode > 1) return { season: episode.season, episode: episode.episode - 1 }

  const previousSeason = seasons
    .filter((season) => season.number !== 0 && season.number < episode.season)
    .sort((a, b) => b.number - a.number)[0]

  if (!previousSeason || previousSeason.episodesCount === 0) return null

  return { season: previousSeason.number, episode: previousSeason.episodesCount }
}

function requiresCatchUp(
  episode: SeasonEpisode,
  seasons: SeriesSeasons,
  watchedEpisodes: WatchedEpisodeProgress[]
) {
  if (episode.isSpecial || episode.season === 0) return false

  const previous = previousRegularEpisode(episode, seasons)
  if (!previous) return false

  const watched = watchedEpisodes.some(
    (mark) => mark.season === previous.season && mark.episode === previous.episode
  )

  return !watched
}

function EpisodeRow({
  serie,
  seasons,
  episode,
  watchedEpisodes,
}: {
  serie: Data.Serie
  seasons: SeriesSeasons
  episode: SeasonEpisode
  watchedEpisodes: WatchedEpisodeProgress[]
}) {
  const userSettingsQuery = useUserSettingsQuery()
  const sonarrAvailable = userSettingsQuery.data?.data.providerAvailability.sonarr ?? false
  const watchedEpisode = watchedEpisodes.find(
    (watched) => watched.season === episode.season && watched.episode === episode.episode
  )
  const watchedAt = watchedEpisode?.watchedAt ?? null
  const watched = Boolean(watchedEpisode)
  const watchEpisodeMutation = useWatchEpisodeMutation()
  const unwatchEpisodeMutation = useUnwatchEpisodeMutation()
  const watchBeforeMutation = useWatchBeforeMutation()
  const [pendingCatchUp, setPendingCatchUp] = useState(false)
  const [pendingCatchUpDeleteFile, setPendingCatchUpDeleteFile] = useState(false)
  const isPending =
    watchEpisodeMutation.isPending ||
    unwatchEpisodeMutation.isPending ||
    watchBeforeMutation.isPending
  const contextMenuOpenRef = useRef(false)

  function markWatched(deleteFile: boolean) {
    if (requiresCatchUp(episode, seasons, watchedEpisodes)) {
      setPendingCatchUpDeleteFile(deleteFile)
      setPendingCatchUp(true)
      return
    }

    watchEpisodeMutation.mutate({
      params: { id: serie.id, season: episode.season, episode: episode.episode },
      ...(deleteFile ? { body: { deleteFile: true } } : {}),
    })
  }

  function toggleWatched(checked: boolean) {
    if (!checked) {
      unwatchEpisodeMutation.mutate({
        params: { id: serie.id, season: episode.season, episode: episode.episode },
      })
      return
    }

    markWatched(false)
  }

  async function confirmCatchUp(includeBefore: boolean) {
    setPendingCatchUp(false)
    const deleteFile = pendingCatchUpDeleteFile
    setPendingCatchUpDeleteFile(false)
    const params = { id: serie.id, season: episode.season, episode: episode.episode }

    if (includeBefore && deleteFile) {
      await watchEpisodeMutation.mutateAsync({ params, body: { deleteFile: true } })
      await watchBeforeMutation.mutateAsync({ params })
      return
    }

    if (includeBefore) {
      await watchBeforeMutation.mutateAsync({ params })
      return
    }

    await watchEpisodeMutation.mutateAsync({
      params,
      ...(deleteFile ? { body: { deleteFile: true } } : {}),
    })
  }

  const checkbox = isPending ? (
    <LoaderCircle className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
  ) : (
    <Checkbox
      checked={Boolean(watched)}
      aria-label={watched ? `Unmark ${episode.name} as watched` : `Mark ${episode.name} as watched`}
      className="size-5 rounded-full"
      onCheckedChange={(checked) => {
        if (contextMenuOpenRef.current) return
        void toggleWatched(Boolean(checked))
      }}
    />
  )

  return (
    <>
      <article
        className={cn(
          'grid grid-cols-[2rem_1fr_auto] items-center gap-y-2 border-t py-4 first:border-t-0 first:pt-2 last:pb-0 sm:grid-cols-[2rem_1fr_10rem]',
          watched && 'opacity-80'
        )}
      >
        <div className="col-start-2 flex flex-wrap items-center gap-x-4 leading-none">
          <span className="font-mono text-xs uppercase leading-none tracking-[0.18em] text-muted-foreground">
            S{episode.season}·E{episode.episode}
          </span>
          {episode.duration && (
            <span className="inline-flex items-center gap-1 font-mono text-xs leading-none text-muted-foreground">
              <Clock3 className="size-3.5" aria-hidden="true" />
              {episode.duration} min
            </span>
          )}
          {episode.releasedAt && (
            <span className="inline-flex items-center gap-1 font-mono text-xs leading-none text-muted-foreground">
              {episode.isReleased ? (
                <Calendar className="size-3.5" aria-hidden="true" />
              ) : (
                <CalendarClock className="size-3.5" aria-hidden="true" />
              )}
              {formatDate(episode.releasedAt)}
            </span>
          )}
          {episode.isSpecial && <Badge variant="outline">Special</Badge>}
        </div>

        <div className="row-start-2 col-start-3 hidden flex-col items-end justify-center gap-1 text-sm text-muted-foreground sm:flex sm:pr-3 sm:text-right">
          {watchedAt && (
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              <CalendarCheck2 className="size-3.5" aria-hidden="true" />
              {formatDate(watchedAt)}
            </span>
          )}
        </div>

        <div className="row-start-2 self-start mt-0.5 flex items-center">
          {episode.isReleased &&
            (sonarrAvailable && !watched ? (
              <ContextMenu onOpenChange={(open) => (contextMenuOpenRef.current = open)}>
                <ContextMenuTrigger>{checkbox}</ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem
                    onClick={() => markWatched(true)}
                    disabled={watchEpisodeMutation.isPending}
                  >
                    {watchEpisodeMutation.isPending && (
                      <LoaderCircle className="animate-spin" aria-hidden="true" />
                    )}
                    Mark as watched and delete file
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ) : (
              checkbox
            ))}
        </div>

        <h3 className="row-start-2 col-start-2 min-w-0 text-base font-medium tracking-tight">
          {episode.name}
        </h3>
        {watchedAt ? (
          <span className="col-start-2 row-start-3 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground sm:hidden">
            <CalendarCheck2 className="size-3.5" aria-hidden="true" />
            {formatDate(watchedAt)}
          </span>
        ) : (
          episode.isReleased && (
            <span className="col-start-2 row-start-3 font-mono text-xs text-muted-foreground sm:hidden">
              Ready to Watch
            </span>
          )
        )}

        {episode.summary && (
          <p className="col-start-2 col-span-2 hidden text-sm text-muted-foreground sm:block sm:line-clamp-2">
            {episode.summary}
          </p>
        )}
      </article>

      <AlertDialog open={pendingCatchUp} onOpenChange={setPendingCatchUp}>
        <AlertDialogContent onClickOverlay={() => setPendingCatchUp(false)}>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark previous episodes as watched?</AlertDialogTitle>
            <AlertDialogDescription>
              Some earlier episodes have not been marked as watched. Mark them all as watched too?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => void confirmCatchUp(false)}>
              Just this episode
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => void confirmCatchUp(true)}>
              Mark all previous too
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
