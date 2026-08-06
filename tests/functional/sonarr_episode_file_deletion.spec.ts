import Serie from '#models/serie'
import User from '#models/user'
import UserSettings from '#models/user_settings'
import { sonarr } from '#services/sonarr_provider'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

type SonarrCall = { providerId: string; season: number; episode: number }
const originalDeleteEpisodeFileByCatalogProviderId =
  sonarr.deleteEpisodeFileByCatalogProviderId.bind(sonarr)

test.group('Sonarr episode file deletion', (group) => {
  group.each.setup(() => testUtils.db().truncate())
  group.each.setup(() => restoreSonarrConfig())
  group.each.setup(() => {
    return () => {
      sonarr.deleteEpisodeFileByCatalogProviderId = originalDeleteEpisodeFileByCatalogProviderId
    }
  })

  test('deletes the Sonarr episode file when enabled and available', async ({ assert, client }) => {
    const calls = spyOnSonarrDeletion()
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    await flushProviderAction()
    assert.deepEqual(calls, [{ providerId: 'series-1', season: 1, episode: 1 }])
  })

  test('does not delete when the setting is disabled', async ({ assert, client }) => {
    const calls = spyOnSonarrDeletion()
    const { user, serie } = await makeUserWithSerie()

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(calls, [])
  })

  test('does not delete when Sonarr is unavailable', async ({ assert, client }) => {
    const calls = spyOnSonarrDeletion()
    app.config.set('sonarr_provider.default', undefined)
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(calls, [])
  })

  test('does not retry deletion when an episode is already watched', async ({ assert, client }) => {
    const calls = spyOnSonarrDeletion()
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
    assert.lengthOf(calls, 1)
  })

  test('provider failures do not fail watched marking or watched time', async ({
    assert,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(async () => {
      throw new Error('Fake Sonarr episode file deletion failed')
    })
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
      assert.deepEqual(calls, [{ providerId: 'series-1', season: 1, episode: 1 }])
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

function spyOnSonarrDeletion(implementation: () => Promise<void> = async () => {}) {
  const calls: SonarrCall[] = []

  app.config.set('sonarr_provider.default', 'fake')
  sonarr.deleteEpisodeFileByCatalogProviderId = async (providerId, season, episode) => {
    calls.push({ providerId, season, episode })
    await implementation()
  }

  return calls
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
