import Movie from '#models/movie'
import User from '#models/user'
import UserSettings from '#models/user_settings'
import { radarr } from '#services/radarr_provider'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import sinon from 'sinon'

test.group('Radarr movie file deletion', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('deletes the Radarr movie file when enabled and available', async ({ assert, client }) => {
    const spy = sinon.spy(radarr, 'deleteMovieFileByCatalogProviderId')
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })

    const response = await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    assert.isTrue(spy.calledOnce)
    spy.restore()
  })

  test('does not delete when setting is disabled', async ({ assert, client }) => {
    const spy = sinon.spy(radarr, 'deleteMovieFileByCatalogProviderId')
    const { user, movie } = await makeUserWithMovie()

    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()

    assert.isTrue(spy.notCalled)
    spy.restore()
  })

  test('deletes the Radarr movie file when deleteFile is requested even with setting disabled', async ({
    assert,
    client,
  }) => {
    const spy = sinon.spy(radarr, 'deleteMovieFileByCatalogProviderId')
    const { user, movie } = await makeUserWithMovie()

    const response = await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    assert.isTrue(spy.calledWith('movie-1'))
    spy.restore()
  })

  test('does not retry deletion when already watched movie is requested with deleteFile', async ({
    assert,
    client,
  }) => {
    const spy = sinon.spy(radarr, 'deleteMovieFileByCatalogProviderId')
    const { user, movie } = await makeUserWithMovie()

    await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()
    await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()

    assert.equal(spy.callCount, 1)
    spy.restore()
  })

  test('does not delete when Radarr is unavailable even with deleteFile requested', async ({
    assert,
    cleanup,
    client,
  }) => {
    const spy = sinon.spy(radarr, 'deleteMovieFileByCatalogProviderId')
    const radarrDriver = app.config.get('radarr_provider.default')
    app.config.set('radarr_provider.default', undefined)
    cleanup(() => app.config.set('radarr_provider.default', radarrDriver))
    const { user, movie } = await makeUserWithMovie()

    await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()

    assert.isTrue(spy.notCalled)
    spy.restore()
  })

  test('does not delete when Radarr is unavailable', async ({ assert, cleanup, client }) => {
    const spy = sinon.spy(radarr, 'deleteMovieFileByCatalogProviderId')
    const radarrDriver = app.config.get('radarr_provider.default')
    app.config.set('radarr_provider.default', undefined)
    cleanup(() => app.config.set('radarr_provider.default', radarrDriver))
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })

    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()

    assert.isTrue(spy.notCalled)
    spy.restore()
  })

  test('does not retry deletion when movie is already watched', async ({ assert, client }) => {
    const spy = sinon.spy(radarr, 'deleteMovieFileByCatalogProviderId')
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })

    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()
    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()

    assert.equal(spy.callCount, 1)
    spy.restore()
  })

  test('provider failures do not fail watched marking or watched time', async ({
    assert,
    cleanup,
    client,
  }) => {
    const stub = sinon
      .stub(radarr, 'deleteMovieFileByCatalogProviderId')
      .rejects(new Error('Fake Radarr movie file deletion failed'))
    cleanup(() => stub.restore())
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })
    const logs: Array<{ payload: Record<string, unknown>; message: string }> = []
    const originalError = logger.error
    logger.error = ((payload: Record<string, unknown>, message: string) => {
      logs.push({ payload, message })
    }) as typeof logger.error
    cleanup(() => {
      logger.error = originalError
    })

    const response = await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    await user.refresh()
    assert.equal(user.watchedTime, 170)
    assert.isTrue(stub.calledWith('movie-1'))
    assert.deepInclude(logs[0], {
      message: 'Radarr movie file deletion failed',
    })
    assert.deepInclude(logs[0].payload, {
      userId: user.id,
      libraryEntryId: movie.id,
      catalogProviderId: 'movie-1',
    })
  })
})

async function makeUserWithMovie() {
  const user = await User.create({
    fullName: 'Radarr Action',
    email: `radarr-action-${crypto.randomUUID()}@example.com`,
    password: 'secret123',
  })
  const movie = await Movie.create({
    userId: user.id,
    provider: 'tmdb',
    providerId: 'movie-1',
    name: 'Heat',
    bannerPath: '/movie-1.jpg',
    posterPath: '/movie-1-poster.jpg',
    releasedAt: DateTime.fromISO('1995-12-15'),
    summary: 'professional thief and relentless detective collide.',
  })

  return { user, movie }
}
