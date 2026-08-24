import { events } from '#generated/events'
import Movie from '#models/movie'
import User from '#models/user'
import UserSettings from '#models/user_settings'
import { WatchedMovie } from '#models/watched_mark'
import DeleteRadarrMovieFile from '#listeners/delete_radarr_movie_file'
import { radarr } from '#services/radarr_provider'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import sinon from 'sinon'

test.group('Delete Radarr movie file listener', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('defers provider action until transaction commit', async ({ assert }) => {
    const listener = new DeleteRadarrMovieFile()
    const { movie } = await makeUserWithMovie()
    const stub = sinon.stub(listener, 'deleteMovieFile').resolves()

    await db.transaction(async (trx) => {
      const watched = new WatchedMovie()
      watched.userId = movie.userId
      watched.libraryEntryId = movie.id
      watched.useTransaction(trx)

      const event = new events.MovieWatched({ watched })
      listener.handle(event)

      assert.isTrue(stub.notCalled)
    })

    assert.isTrue(stub.calledOnce)
  })

  test('does not wait for the provider action after commit', async ({ assert }) => {
    const listener = new DeleteRadarrMovieFile()
    const stub = sinon.stub(listener, 'deleteMovieFile').returns(new Promise(() => {}))
    let afterCommit: (() => unknown) | undefined
    const event = {
      $trx: {
        after(name: string, callback: () => unknown) {
          assert.equal(name, 'commit')
          afterCommit = callback
          return this
        },
      },
    } as unknown as InstanceType<typeof events.MovieWatched>

    await listener.handle(event)

    assert.isDefined(afterCommit)
    assert.isUndefined(afterCommit!())
    assert.isTrue(stub.calledOnce)
  })

  test('deletes the Radarr movie file when enabled', async ({ assert, cleanup }) => {
    const stub = sinon.stub(radarr, 'deleteMovieFileByCatalogProviderId').resolves()
    cleanup(() => stub.restore())

    const listener = new DeleteRadarrMovieFile()
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })

    const event = makeWatchedEvent(user, movie, false)

    await listener.deleteMovieFile(event)

    assert.isTrue(stub.calledOnceWith('movie-1'))
  })

  test('skips deletion when setting is disabled', async ({ assert, cleanup }) => {
    const stub = sinon.stub(radarr, 'deleteMovieFileByCatalogProviderId').resolves()
    cleanup(() => stub.restore())

    const listener = new DeleteRadarrMovieFile()
    const { user, movie } = await makeUserWithMovie()

    const event = makeWatchedEvent(user, movie, false)

    await listener.deleteMovieFile(event)

    assert.isTrue(stub.notCalled)
  })

  test('deletes the Radarr movie file when deleteFile is true even with setting disabled', async ({
    assert,
    cleanup,
  }) => {
    const stub = sinon.stub(radarr, 'deleteMovieFileByCatalogProviderId').resolves()
    cleanup(() => stub.restore())

    const listener = new DeleteRadarrMovieFile()
    const { user, movie } = await makeUserWithMovie()

    const event = makeWatchedEvent(user, movie, true)

    await listener.deleteMovieFile(event)

    assert.isTrue(stub.calledOnceWith('movie-1'))
  })

  test('skips deletion when Radarr is unavailable', async ({ assert, cleanup }) => {
    const stub = sinon.stub(radarr, 'deleteMovieFileByCatalogProviderId').resolves()
    cleanup(() => stub.restore())

    const radarrDriver = app.config.get('radarr_provider.default')
    app.config.set('radarr_provider.default', undefined)
    cleanup(() => app.config.set('radarr_provider.default', radarrDriver))

    const listener = new DeleteRadarrMovieFile()
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })

    const event = makeWatchedEvent(user, movie, true)

    await listener.deleteMovieFile(event)

    assert.isTrue(stub.notCalled)
  })

  test('logs error payload and does not throw on provider failure', async ({ assert, cleanup }) => {
    const stub = sinon
      .stub(radarr, 'deleteMovieFileByCatalogProviderId')
      .rejects(new Error('Fake Radarr movie file deletion failed'))
    cleanup(() => stub.restore())

    const listener = new DeleteRadarrMovieFile()
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })

    const loggerStub = sinon.stub(logger, 'error')
    cleanup(() => loggerStub.restore())

    const event = makeWatchedEvent(user, movie, false)

    await listener.deleteMovieFile(event)

    assert.isTrue(stub.calledOnceWith('movie-1'))
    assert.isTrue(loggerStub.calledOnce)
    assert.equal(loggerStub.firstCall.args[1], 'Radarr movie file deletion failed')
    assert.deepInclude(loggerStub.firstCall.args[0], {
      userId: user.id,
      libraryEntryId: movie.id,
      catalogProviderId: 'movie-1',
    })
  })
})

function makeWatchedEvent(user: User, movie: Movie, deleteFile = false) {
  const watched = new WatchedMovie()
  watched.userId = user.id
  watched.libraryEntryId = movie.id
  return new events.MovieWatched({ watched, deleteFile })
}

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
