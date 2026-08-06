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
type Cleanup = (callback: () => void) => void

test.group('Sonarr episode file deletion', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('deletes the Sonarr episode file when enabled and available', async ({
    assert,
    cleanup,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(cleanup)
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

  test('does not delete when the setting is disabled', async ({ assert, cleanup, client }) => {
    const calls = spyOnSonarrDeletion(cleanup)
    const { user, serie } = await makeUserWithSerie()

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(calls, [])
  })

  test('does not delete when Sonarr is unavailable', async ({ assert, cleanup, client }) => {
    const calls = spyOnSonarrDeletion(cleanup)
    const sonarrDriver = app.config.get('sonarr_provider.default')
    app.config.set('sonarr_provider.default', undefined)
    cleanup(() => app.config.set('sonarr_provider.default', sonarrDriver))
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(calls, [])
  })

  test('does not retry deletion when an episode is already watched', async ({
    assert,
    cleanup,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(cleanup)
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

  test('deletes Sonarr episode files for new season bulk watched marks', async ({
    assert,
    cleanup,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(cleanup)
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    await flushProviderAction()
    assert.deepEqual(calls, [{ providerId: 'series-1', season: 1, episode: 1 }])
  })

  test('deletes Sonarr episode files for new series bulk watched marks', async ({
    assert,
    cleanup,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(cleanup)
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const response = await client
      .post(`/api/library/series/${serie.id}/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    await flushProviderAction()
    assert.deepEqual(calls, [
      { providerId: 'series-1', season: 0, episode: 1 },
      { providerId: 'series-1', season: 1, episode: 1 },
    ])
  })

  test('bulk marking does not retry Sonarr deletion for already watched episodes', async ({
    assert,
    cleanup,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(cleanup)
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    await client
      .post(`/api/library/series/${serie.id}/seasons/0/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()
    await client.post(`/api/library/series/${serie.id}/watch`).loginAs(user).withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(calls, [
      { providerId: 'series-1', season: 0, episode: 1 },
      { providerId: 'series-1', season: 1, episode: 1 },
    ])
  })

  test('bulk marking does not delete when the setting is disabled', async ({
    assert,
    cleanup,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(cleanup)
    const { user, serie } = await makeUserWithSerie()

    await client.post(`/api/library/series/${serie.id}/watch`).loginAs(user).withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(calls, [])
  })

  test('bulk marking does not delete when Sonarr is unavailable', async ({
    assert,
    cleanup,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(cleanup)
    const sonarrDriver = app.config.get('sonarr_provider.default')
    app.config.set('sonarr_provider.default', undefined)
    cleanup(() => app.config.set('sonarr_provider.default', sonarrDriver))
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    await client.post(`/api/library/series/${serie.id}/watch`).loginAs(user).withCsrfToken()

    await flushProviderAction()
    assert.deepEqual(calls, [])
  })

  test('provider failures do not fail watched marking or watched time', async ({
    assert,
    cleanup,
    client,
  }) => {
    const calls = spyOnSonarrDeletion(cleanup, async () => {
      throw new Error('Fake Sonarr episode file deletion failed')
    })
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })
    const logs: Array<{ payload: Record<string, unknown>; message: string }> = []
    const originalError = logger.error
    logger.error = ((payload: Record<string, unknown>, message: string) => {
      logs.push({ payload, message })
    }) as typeof logger.error
    cleanup(() => {
      logger.error = originalError
    })

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
  })
})

function spyOnSonarrDeletion(
  cleanup: Cleanup,
  implementation: () => Promise<void> = async () => {}
) {
  const calls: SonarrCall[] = []
  const originalDelete = sonarr.deleteEpisodeFileByCatalogProviderId.bind(sonarr)

  sonarr.deleteEpisodeFileByCatalogProviderId = async (providerId, season, episode) => {
    calls.push({ providerId, season, episode })
    await implementation()
  }
  cleanup(() => {
    sonarr.deleteEpisodeFileByCatalogProviderId = originalDelete
  })

  return calls
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
