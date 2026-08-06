import { fakeEpisodeResource, fakeSeriesResource } from '#generated/sonarr/@faker-js/faker.gen'
import Serie from '#models/serie'
import User from '#models/user'
import UserSettings from '#models/user_settings'
import WatchedMark from '#models/watched_mark'
import type { DeletedSonarrEpisodeFile, FakeSonarrProviderConfig } from '#providers/sonarr/types'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Sonarr episode file deletion', (group) => {
  group.each.setup(() => restoreSonarrConfig())
  group.each.setup(async () => {
    await WatchedMark.query().delete()
    await Serie.query().delete()
    await UserSettings.query().delete()
    await User.query().delete()
  })

  test('deletes the Sonarr episode file when enabled and available', async ({ assert, client }) => {
    const deletedEpisodeFiles = useFakeSonarr()
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    await flushProviderAction()
    assert.deepEqual(deletedEpisodeFiles, [
      { providerId: 'series-1', season: 1, episode: 1, episodeFileId: 42 },
    ])
  })

  test('does not delete when the setting is disabled', async ({ assert, client }) => {
    const deletedEpisodeFiles = useFakeSonarr()
    const { user, serie } = await makeUserWithSerie()

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(deletedEpisodeFiles, [])
  })

  test('does not delete when Sonarr is unavailable', async ({ assert, client }) => {
    const deletedEpisodeFiles = useFakeSonarr()
    app.config.set('sonarr_provider.default', undefined)
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(deletedEpisodeFiles, [])
  })

  test('does not retry deletion when an episode is already watched', async ({ assert, client }) => {
    const deletedEpisodeFiles = useFakeSonarr()
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

    await flushProviderAction()
    assert.lengthOf(deletedEpisodeFiles, 1)
  })

  test('deletes after a transactional bulk season watch commits', async ({ assert, client }) => {
    const deletedEpisodeFiles = useFakeSonarr()
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    await flushProviderAction()
    assert.deepEqual(deletedEpisodeFiles, [
      { providerId: 'series-1', season: 1, episode: 1, episodeFileId: 42 },
    ])
  })

  test('provider failures do not fail watched marking or watched time', async ({
    assert,
    client,
  }) => {
    const deletedEpisodeFiles = useFakeSonarr({ failDeletion: true })
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })
    const logs: Array<{ payload: Record<string, unknown>; message: string }> = []
    const originalError = logger.error
    logger.error = ((payload: Record<string, unknown>, message: string) => {
      logs.push({ payload, message })
    }) as typeof logger.error

    try {
      const response = await client
        .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
        .loginAs(user)
        .withCsrfToken()

      response.assertOk()
      await flushProviderAction()
      await user.refresh()
      assert.equal(user.watchedTime, 24)
      assert.deepEqual(deletedEpisodeFiles, [])
      assert.deepInclude(logs[0], {
        message: 'Sonarr episode file deletion failed',
      })
      assert.deepInclude(logs[0].payload, {
        userId: user.id,
        libraryEntryId: serie.id,
        catalogProviderId: 'series-1',
        season: 1,
        episode: 1,
      })
    } finally {
      logger.error = originalError
    }
  })
})

function useFakeSonarr(config: Partial<FakeSonarrProviderConfig> = {}) {
  const deletedEpisodeFiles: DeletedSonarrEpisodeFile[] = []

  app.config.set('sonarr_provider.default', 'fake')
  app.config.set('sonarr_provider.drivers.fake', {
    series: [{ ...fakeSeriesResource(), id: 1, tmdbId: 1 }],
    episodes: [
      {
        ...fakeEpisodeResource(),
        seriesId: 1,
        seasonNumber: 1,
        episodeNumber: 1,
        hasFile: true,
        episodeFileId: 42,
      },
    ],
    deletedEpisodeFiles,
    ...config,
  })

  return deletedEpisodeFiles
}

function restoreSonarrConfig() {
  const defaultDriver = app.config.get('sonarr_provider.default')
  const fakeConfig = app.config.get('sonarr_provider.drivers.fake')

  return () => {
    app.config.set('sonarr_provider.default', defaultDriver)
    app.config.set('sonarr_provider.drivers.fake', fakeConfig)
  }
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

function flushProviderAction() {
  return new Promise((resolve) => setImmediate(resolve))
}
