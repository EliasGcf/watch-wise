import Serie from '#models/serie'
import User from '#models/user'
import UserSettings from '#models/user_settings'
import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import { events } from '#generated/events'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Sonarr episode file deletion', (group) => {
  let buffer: ReturnType<typeof emitter.fake>

  group.each.setup(() => {
    buffer = emitter.fake([events.EpisodeWatched])
    return () => emitter.restore()
  })

  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('deletes the Sonarr episode file when enabled and available', async ({ client }) => {
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    buffer.assertEmitted(events.EpisodeWatched, (event) =>
      matchesEpisodeWatchedEvent(event, user, serie, {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        deleteFile: false,
      })
    )
  })

  test('does not delete when the setting is disabled', async ({ client }) => {
    const { user, serie } = await makeUserWithSerie()

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    buffer.assertEmitted(events.EpisodeWatched, (event) =>
      matchesEpisodeWatchedEvent(event, user, serie, {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        deleteFile: false,
      })
    )
  })

  test('deletes the Sonarr episode file when deleteFile is requested even with the setting disabled', async ({
    client,
  }) => {
    const { user, serie } = await makeUserWithSerie()

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    buffer.assertEmitted(events.EpisodeWatched, (event) =>
      matchesEpisodeWatchedEvent(event, user, serie, {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        deleteFile: true,
      })
    )
  })

  test('does not retry deletion when an already watched episode is requested with deleteFile', async ({
    client,
  }) => {
    const { user, serie } = await makeUserWithSerie()

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()
    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()

    buffer.assertEmittedCount(events.EpisodeWatched, 1)
    buffer.assertEmitted(events.EpisodeWatched, (event) =>
      matchesEpisodeWatchedEvent(event, user, serie, {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        deleteFile: true,
      })
    )
  })

  test('does not retry deletion when an episode is already watched', async ({ client }) => {
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()
    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    buffer.assertEmittedCount(events.EpisodeWatched, 1)
    buffer.assertEmitted(events.EpisodeWatched, (event) =>
      matchesEpisodeWatchedEvent(event, user, serie, {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        deleteFile: false,
      })
    )
  })

  test('deletes Sonarr episode files for new season bulk watched marks', async ({ client }) => {
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    buffer.assertEmittedCount(events.EpisodeWatched, 1)
    buffer.assertEmitted(events.EpisodeWatched, (event) =>
      matchesEpisodeWatchedEvent(event, user, serie, {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        deleteFile: false,
      })
    )
  })

  test('deletes Sonarr episode files for new series bulk watched marks', async ({ client }) => {
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const response = await client
      .post(`/api/library/series/${serie.id}/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    buffer.assertEmittedCount(events.EpisodeWatched, 1)
    buffer.assertEmitted(events.EpisodeWatched, (event) =>
      matchesEpisodeWatchedEvent(event, user, serie, {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        deleteFile: false,
      })
    )
  })

  test('bulk marking does not retry Sonarr deletion for already watched episodes', async ({
    client,
  }) => {
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    await client
      .post(`/api/library/series/${serie.id}/seasons/0/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()
    await client.post(`/api/library/series/${serie.id}/watch`).loginAs(user).withCsrfToken()

    buffer.assertEmittedCount(events.EpisodeWatched, 2)
    for (const episode of [
      { providerId: 'episode-0-1', season: 0, episode: 1 },
      { providerId: 'episode-1-1', season: 1, episode: 1 },
    ]) {
      buffer.assertEmitted(events.EpisodeWatched, (event) =>
        matchesEpisodeWatchedEvent(event, user, serie, { ...episode, deleteFile: false })
      )
    }
  })

  test('deletes Sonarr episode files for newly marked episodes before a target', async ({
    client,
  }) => {
    const user = await User.create({
      fullName: 'Sonarr Catch Up',
      email: `sonarr-catch-up-${crypto.randomUUID()}@example.com`,
      password: 'secret123',
    })
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })
    const serie = await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-2',
      name: 'Fake Multi Season Series',
      bannerPath: '/series-2.jpg',
      posterPath: '/series-2-poster.jpg',
      releasedAt: DateTime.fromISO('1998-01-01'),
      summary: 'A fake multi season series.',
    })

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/2/episodes/1/watch-before`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    buffer.assertEmittedCount(events.EpisodeWatched, 3)
    for (const episode of [
      { providerId: 'series-2-s1e1', season: 1, episode: 1 },
      { providerId: 'series-2-s1e2', season: 1, episode: 2 },
      { providerId: 'series-2-s2e1', season: 2, episode: 1 },
    ]) {
      buffer.assertEmitted(events.EpisodeWatched, (event) =>
        matchesEpisodeWatchedEvent(event, user, serie, { ...episode, deleteFile: false })
      )
    }
  })
})

function matchesEpisodeWatchedEvent(
  event: { data: InstanceType<typeof events.EpisodeWatched> },
  user: User,
  serie: Serie,
  expected: { providerId: string; season: number; episode: number; deleteFile: boolean }
) {
  return (
    event.data.watched.userId === user.id &&
    event.data.watched.libraryEntryId === serie.id &&
    event.data.watched.providerId === expected.providerId &&
    event.data.watched.season === expected.season &&
    event.data.watched.episode === expected.episode &&
    event.data.deleteFile === expected.deleteFile
  )
}

async function makeUserWithSerie() {
  const user = await User.create({
    fullName: 'Sonarr Action',
    email: `sonarr-action-${crypto.randomUUID()}@example.com`,
    password: 'secret123',
  })
  const serie = await Serie.create({
    userId: user.id,
    provider: 'tmdb',
    providerId: 'series-1',
    name: 'Heat Vision and Jack',
    bannerPath: '/series-1.jpg',
    posterPath: '/series-1-poster.jpg',
    releasedAt: DateTime.fromISO('1999-01-01'),
    summary: 'A pilot about a super-intelligent astronaut.',
  })

  return { user, serie }
}
