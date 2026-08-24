import { events } from '#generated/events'
import Serie from '#models/serie'
import User from '#models/user'
import UserSettings from '#models/user_settings'
import { WatchedEpisode } from '#models/watched_mark'
import DeleteSonarrEpisodeFile from '#listeners/delete_sonarr_episode_file'
import { sonarr } from '#services/sonarr_provider'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import testUtils from '@adonisjs/core/services/test_utils'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import sinon from 'sinon'

test.group('Delete Sonarr episode file listener', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('defers provider action until transaction commit', async ({ assert }) => {
    const listener = new DeleteSonarrEpisodeFile()
    const { serie } = await makeUserWithSerie()
    const stub = sinon.stub(listener, 'deleteEpisodeFile').resolves()

    await db.transaction(async (trx) => {
      const watched = new WatchedEpisode()
      watched.userId = serie.userId
      watched.libraryEntryId = serie.id
      watched.season = 1
      watched.episode = 1
      watched.useTransaction(trx)

      const event = new events.EpisodeWatched({ watched })
      listener.handle(event)

      assert.isTrue(stub.notCalled)
    })

    assert.isTrue(stub.calledOnce)
  })

  test('does not wait for the provider action after commit', ({ assert }) => {
    const listener = new DeleteSonarrEpisodeFile()
    const stub = sinon.stub(listener, 'deleteEpisodeFile').returns(new Promise(() => {}))
    let afterCommit: (() => unknown) | undefined
    const event = {
      $trx: {
        after(name: string, callback: () => unknown) {
          assert.equal(name, 'commit')
          afterCommit = callback
          return this
        },
      },
    } as unknown as InstanceType<typeof events.EpisodeWatched>

    listener.handle(event)

    assert.isDefined(afterCommit)
    assert.isUndefined(afterCommit!())
    assert.isTrue(stub.calledOnce)
  })

  test('deletes the Sonarr episode file when enabled', async ({ assert, cleanup }) => {
    const stub = sinon.stub(sonarr, 'deleteEpisodeFileByCatalogProviderId').resolves()
    cleanup(() => stub.restore())

    const listener = new DeleteSonarrEpisodeFile()
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const event = makeWatchedEvent(user, serie, false)

    await listener.deleteEpisodeFile(event)

    assert.isTrue(stub.calledOnceWith('series-1', 2, 3))
  })

  test('skips deletion when setting is disabled', async ({ assert, cleanup }) => {
    const stub = sinon.stub(sonarr, 'deleteEpisodeFileByCatalogProviderId').resolves()
    cleanup(() => stub.restore())

    const listener = new DeleteSonarrEpisodeFile()
    const { user, serie } = await makeUserWithSerie()

    const event = makeWatchedEvent(user, serie, false)

    await listener.deleteEpisodeFile(event)

    assert.isTrue(stub.notCalled)
  })

  test('deletes the Sonarr episode file when deleteFile is true even with setting disabled', async ({
    assert,
    cleanup,
  }) => {
    const stub = sinon.stub(sonarr, 'deleteEpisodeFileByCatalogProviderId').resolves()
    cleanup(() => stub.restore())

    const listener = new DeleteSonarrEpisodeFile()
    const { user, serie } = await makeUserWithSerie()

    const event = makeWatchedEvent(user, serie, true)

    await listener.deleteEpisodeFile(event)

    assert.isTrue(stub.calledOnceWith('series-1', 2, 3))
  })

  test('skips deletion when Sonarr is unavailable', async ({ assert, cleanup }) => {
    const stub = sinon.stub(sonarr, 'deleteEpisodeFileByCatalogProviderId').resolves()
    cleanup(() => stub.restore())

    const sonarrDriver = app.config.get('sonarr_provider.default')
    app.config.set('sonarr_provider.default', undefined)
    cleanup(() => app.config.set('sonarr_provider.default', sonarrDriver))

    const listener = new DeleteSonarrEpisodeFile()
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const event = makeWatchedEvent(user, serie, true)

    await listener.deleteEpisodeFile(event)

    assert.isTrue(stub.notCalled)
  })

  test('logs error payload and does not throw on provider failure', async ({ assert, cleanup }) => {
    const stub = sinon
      .stub(sonarr, 'deleteEpisodeFileByCatalogProviderId')
      .rejects(new Error('Fake Sonarr episode file deletion failed'))
    cleanup(() => stub.restore())

    const listener = new DeleteSonarrEpisodeFile()
    const { user, serie } = await makeUserWithSerie()
    await UserSettings.create({ userId: user.id, deleteSonarrEpisodeFiles: true })

    const loggerStub = sinon.stub(logger, 'error')
    cleanup(() => loggerStub.restore())

    const event = makeWatchedEvent(user, serie, false)

    await listener.deleteEpisodeFile(event)

    assert.isTrue(stub.calledOnceWith('series-1', 2, 3))
    assert.isTrue(loggerStub.calledOnce)
    assert.equal(loggerStub.firstCall.args[1], 'Sonarr episode file deletion failed')
    assert.deepInclude(loggerStub.firstCall.args[0], {
      userId: user.id,
      libraryEntryId: serie.id,
      catalogProviderId: 'series-1',
      season: 2,
      episode: 3,
    })
  })
})

function makeWatchedEvent(user: User, serie: Serie, deleteFile = false) {
  const watched = new WatchedEpisode()
  watched.userId = user.id
  watched.libraryEntryId = serie.id
  watched.season = 2
  watched.episode = 3
  return new events.EpisodeWatched({ watched, deleteFile })
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
