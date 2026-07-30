import Serie from '#models/serie'
import { WatchedEpisode } from '#models/watched_mark'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime, Settings } from 'luxon'

test.group('Library series episodes', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('authenticated users can open a series details page and view provider-sourced seasons', async ({
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Morgan Series',
      email: 'morgan-series@example.com',
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

    await browserContext.loginAs(user)
    const detailsPage = await visit(`/app/library/series/${serie.id}`)
    await detailsPage.assertTextContains('body', 'Heat Vision and Jack')
    await detailsPage.assertTextContains('body', 'Seasons')
    await detailsPage.assertTextContains('body', 'Specials')
    await detailsPage.assertTextContains('body', 'Season 1')
  })

  test('series listing api is not exposed', async ({ client }) => {
    const user = await User.create({
      fullName: 'Progress Viewer',
      email: 'progress-viewer@example.com',
      password: 'secret123',
    })

    const response = await client.get('/api/library/series').loginAs(user)

    response.assertNotFound()
  })

  test('authenticated users load provider-sourced episodes for a single season', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Jordan Series',
      email: 'jordan-series@example.com',
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

    const response = await client
      .get(`/api/library/series/${serie.id}/seasons/1/episodes`)
      .loginAs(user)
    response.assertOk()
    const { data } = response.body()

    assert.deepEqual(data, [
      {
        providerId: 'episode-1-1',
        season: 1,
        episode: 1,
        name: 'Pilot',
        releasedAt: '1999-01-01',
        duration: 24,
        summary: 'Jack Austin meets his talking motorcycle.',
        isReleased: true,
        isSpecial: false,
        watched: null,
      },
      {
        providerId: 'episode-1-2',
        season: 1,
        episode: 2,
        name: 'Future Episode',
        releasedAt: '2999-01-01',
        duration: 25,
        summary: 'An episode from the future.',
        isReleased: false,
        isSpecial: false,
        watched: null,
      },
    ])
  })

  test('authenticated users can mark a released episode once and then unmark it', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Taylor Series',
      email: 'taylor-series@example.com',
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
    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()
    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    const watchedMarks = await WatchedEpisode.query()
      .where('userId', user.id)
      .where('libraryEntryId', serie.id)

    assert.lengthOf(watchedMarks, 1)
    assert.include(watchedMarks[0].serialize(), {
      providerId: 'episode-1-1',
      type: 'episode',
      season: 1,
      episode: 1,
      duration: 24,
    })
    assert.isTrue(watchedMarks[0].watchedAt <= DateTime.now())

    await user.refresh()
    assert.equal(user.watchedTime, 24)

    await browserContext.loginAs(user)
    const libraryPage = await visit('/app/library')
    await libraryPage.assertTextContains('body', '50%')

    await serie.merge({ providerId: 'series-1-changed' }).save()
    const persistedSnapshot = await WatchedEpisode.query()
      .where('userId', user.id)
      .where('libraryEntryId', serie.id)
      .firstOrFail()
    assert.include(persistedSnapshot.serialize(), {
      providerId: 'episode-1-1',
      type: 'episode',
      duration: 24,
    })

    const detailsResponse = await client
      .get(`/api/library/series/${serie.id}/seasons/1/episodes`)
      .loginAs(user)
    detailsResponse.assertOk()
    const episodes = detailsResponse.body().data
    assert.deepInclude(episodes[0], {
      season: 1,
      episode: 1,
      watched: {
        watchedAt: watchedMarks[0].watchedAt.toISO(),
      },
    })

    await client
      .delete(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    assert.lengthOf(
      await WatchedEpisode.query().where('userId', user.id).where('libraryEntryId', serie.id),
      0
    )

    await user.refresh()
    assert.equal(user.watchedTime, 0)
  })

  test('series progress is derived from watched marks when serialized', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Derived Progress',
      email: 'derived-progress@example.com',
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
    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    assert.equal(response.body().data.progress, 50)
  })

  test('series details page receives watched episodes for season progress', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Season Progress',
      email: 'season-progress@example.com',
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

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    const response = await client.get(`/app/library/series/${serie.id}`).loginAs(user)
    response.assertOk()

    const page = JSON.parse(
      response
        .text()
        .match(/data-page="([^"]+)"/)![1]
        .replaceAll('&quot;', '"')
    ).props
    assert.deepInclude(page.serie.watchedEpisodes[0], {
      providerId: 'episode-1-1',
      season: 1,
      episode: 1,
      duration: 24,
    })
  })

  test('authenticated users can bulk mark a season as watched without unreleased episodes', async ({
    assert,
    client,
  }) => {
    const watchedAt = DateTime.fromISO('2000-01-01T12:34:56Z')
    Settings.now = () => watchedAt.toMillis()

    const user = await User.create({
      fullName: 'Bulk Season Viewer',
      email: 'bulk-season-viewer@example.com',
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

    try {
      const response = await client
        .post(`/api/library/series/${serie.id}/seasons/1/watch`)
        .loginAs(user)
        .withCsrfToken()

      response.assertOk()

      const watchedMarks = await WatchedEpisode.query()
        .where('userId', user.id)
        .where('libraryEntryId', serie.id)

      assert.lengthOf(watchedMarks, 1)
      assert.notInclude(
        watchedMarks.map((mark) => mark.episode),
        2
      )
      assert.include(watchedMarks[0].serialize(), {
        providerId: 'episode-1-1',
        type: 'episode',
        season: 1,
        episode: 1,
        duration: 24,
      })
      assert.equal(watchedMarks[0].watchedAt.toISO(), watchedAt.toISO())

      await user.refresh()
      assert.equal(user.watchedTime, 24)
    } finally {
      Settings.now = Date.now
    }
  })

  test('authenticated users can bulk mark a specials season as watched', async ({
    assert,
    client,
  }) => {
    const watchedAt = DateTime.fromISO('2000-01-01T12:34:56Z')
    Settings.now = () => watchedAt.toMillis()

    const user = await User.create({
      fullName: 'Bulk Specials Viewer',
      email: 'bulk-specials-viewer@example.com',
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

    try {
      const response = await client
        .post(`/api/library/series/${serie.id}/seasons/0/watch`)
        .loginAs(user)
        .withCsrfToken()

      response.assertOk()

      const watchedMarks = await WatchedEpisode.query()
        .where('userId', user.id)
        .where('libraryEntryId', serie.id)

      assert.lengthOf(watchedMarks, 1)
      assert.include(watchedMarks[0].serialize(), {
        providerId: 'episode-0-1',
        type: 'episode',
        season: 0,
        episode: 1,
        duration: 28,
      })
      assert.equal(watchedMarks[0].watchedAt.toISO(), watchedAt.toISO())

      await user.refresh()
      assert.equal(user.watchedTime, 28)
    } finally {
      Settings.now = Date.now
    }
  })

  test('authenticated users can bulk mark an entire series as watched without unreleased episodes', async ({
    assert,
    client,
  }) => {
    const watchedAt = DateTime.fromISO('2000-01-01T08:00:00Z')
    Settings.now = () => watchedAt.toMillis()

    const user = await User.create({
      fullName: 'Bulk Series Viewer',
      email: 'bulk-series-viewer@example.com',
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

    try {
      const response = await client
        .post(`/api/library/series/${serie.id}/watch`)
        .loginAs(user)
        .withCsrfToken()

      response.assertOk()

      const watchedMarks = await WatchedEpisode.query()
        .where('userId', user.id)
        .where('libraryEntryId', serie.id)
        .orderBy('season')
        .orderBy('episode')

      assert.lengthOf(watchedMarks, 2)
      assert.notInclude(
        watchedMarks.map((mark) => mark.episode),
        2
      )
      assert.deepEqual(
        watchedMarks.map((mark) => ({
          providerId: mark.providerId,
          type: mark.type,
          season: mark.season,
          episode: mark.episode,
          duration: mark.duration,
          watchedAt: mark.watchedAt.toISO(),
        })),
        [
          {
            providerId: 'episode-0-1',
            type: 'episode',
            season: 0,
            episode: 1,
            duration: 28,
            watchedAt: watchedAt.toISO(),
          },
          {
            providerId: 'episode-1-1',
            type: 'episode',
            season: 1,
            episode: 1,
            duration: 24,
            watchedAt: watchedAt.toISO(),
          },
        ]
      )

      await user.refresh()
      assert.equal(user.watchedTime, 52)
    } finally {
      Settings.now = Date.now
    }
  })

  test('series bulk mark button disables after marking released episodes', async ({
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Bulk Button Viewer',
      email: 'bulk-button-viewer@example.com',
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

    await browserContext.loginAs(user)
    const detailsPage = await visit(`/app/library/series/${serie.id}`)
    const markAllButton = detailsPage.getByRole('button', { name: 'Mark all episodes' })

    await markAllButton.click()

    await detailsPage.assertTextContains('body', 'All marked')
    await detailsPage.assertDisabled(detailsPage.getByRole('button', { name: 'All marked' }))
  })

  test('bulk marking preserves existing watched marks, uses one watched date for new marks, and updates watched time', async ({
    assert,
    client,
  }) => {
    const originalWatchedAt = DateTime.fromISO('2001-02-03T04:05:06Z')
    const bulkWatchedAt = DateTime.fromISO('3000-01-01T09:10:11Z')
    Settings.now = () => originalWatchedAt.toMillis()

    const user = await User.create({
      fullName: 'Bulk Preserve Viewer',
      email: 'bulk-preserve-viewer@example.com',
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

    try {
      await client
        .post(`/api/library/series/${serie.id}/seasons/0/episodes/1/watch`)
        .loginAs(user)
        .withCsrfToken()

      await serie.merge({ providerId: 'series-1-changed' }).save()
      Settings.now = () => bulkWatchedAt.toMillis()

      const response = await client
        .post(`/api/library/series/${serie.id}/watch`)
        .loginAs(user)
        .withCsrfToken()

      response.assertOk()

      const watchedMarks = await WatchedEpisode.query()
        .where('userId', user.id)
        .where('libraryEntryId', serie.id)
        .orderBy('season')
        .orderBy('episode')

      assert.lengthOf(watchedMarks, 3)

      const existingMark = watchedMarks[0]
      assert.include(existingMark.serialize(), {
        providerId: 'episode-0-1',
        season: 0,
        episode: 1,
        duration: 28,
      })
      assert.equal(existingMark.watchedAt.toISO(), originalWatchedAt.toISO())

      const newMarks = watchedMarks.slice(1)
      assert.deepEqual(
        newMarks.map((mark) => mark.serialize()),
        [
          {
            id: newMarks[0].id,
            userId: user.id,
            libraryEntryId: serie.id,
            providerId: 'episode-1-1',
            type: 'episode',
            season: 1,
            episode: 1,
            duration: 99,
            watchedAt: bulkWatchedAt.toISO(),
            createdAt: newMarks[0].createdAt.toISO(),
            updatedAt: newMarks[0].updatedAt?.toISO() ?? null,
          },
          {
            id: newMarks[1].id,
            userId: user.id,
            libraryEntryId: serie.id,
            providerId: 'episode-1-2',
            type: 'episode',
            season: 1,
            episode: 2,
            duration: 25,
            watchedAt: bulkWatchedAt.toISO(),
            createdAt: newMarks[1].createdAt.toISO(),
            updatedAt: newMarks[1].updatedAt?.toISO() ?? null,
          },
        ]
      )

      await user.refresh()
      assert.equal(user.watchedTime, 152)
    } finally {
      Settings.now = Date.now
    }
  })

  test('authenticated users cannot view another user series details or episodes', async ({
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Series View',
      email: 'owner-series-view@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Series View',
      email: 'other-series-view@example.com',
      password: 'secret123',
    })
    const serie = await Serie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })
    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(owner)
      .withCsrfToken()

    const detailsResponse = await client.get(`/app/library/series/${serie.id}`).loginAs(otherUser)
    const episodesResponse = await client
      .get(`/api/library/series/${serie.id}/seasons/1/episodes`)
      .loginAs(otherUser)

    detailsResponse.assertNotFound()
    episodesResponse.assertNotFound()
  })

  test('authenticated users cannot mark another user series episode as watched', async ({
    assert,
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Episode Watch',
      email: 'owner-episode-watch@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Episode Watch',
      email: 'other-episode-watch@example.com',
      password: 'secret123',
    })
    const serie = await Serie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })

    const response = await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(otherUser)
      .withCsrfToken()

    response.assertNotFound()
    assert.lengthOf(await WatchedEpisode.query().where('libraryEntryId', serie.id), 0)
    await owner.refresh()
    await otherUser.refresh()
    assert.equal(owner.watchedTime, 0)
    assert.equal(otherUser.watchedTime, 0)
  })

  test('authenticated users cannot unmark another user series episode as watched', async ({
    assert,
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Episode Unwatch',
      email: 'owner-episode-unwatch@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Episode Unwatch',
      email: 'other-episode-unwatch@example.com',
      password: 'secret123',
    })
    const serie = await Serie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })
    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(owner)
      .withCsrfToken()

    const response = await client
      .delete(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(otherUser)
      .withCsrfToken()

    response.assertNotFound()
    assert.lengthOf(
      await WatchedEpisode.query().where('userId', owner.id).where('libraryEntryId', serie.id),
      1
    )
    await owner.refresh()
    await otherUser.refresh()
    assert.equal(owner.watchedTime, 24)
    assert.equal(otherUser.watchedTime, 0)
  })

  test('serialized series progress becomes completed when all provider-counted episodes are watched', async ({
    assert,
    client,
  }) => {
    const testNow = DateTime.fromISO('3000-01-01').toMillis()
    Settings.now = () => testNow

    const user = await User.create({
      fullName: 'Completed Series',
      email: 'completed-series@example.com',
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

    try {
      await client
        .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
        .loginAs(user)
        .withCsrfToken()
      const response = await client
        .post(`/api/library/series/${serie.id}/seasons/1/episodes/2/watch`)
        .loginAs(user)
        .withCsrfToken()

      response.assertOk()
      assert.equal(response.body().data.progress, 100)
    } finally {
      Settings.now = Date.now
    }
  })

  test('special episodes can be watched and unwatched without changing series progress', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Special Viewer',
      email: 'special-viewer@example.com',
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

    await client
      .post(`/api/library/series/${serie.id}/seasons/0/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    const watchedMarks = await WatchedEpisode.query()
      .where('userId', user.id)
      .where('libraryEntryId', serie.id)

    assert.lengthOf(watchedMarks, 1)
    assert.include(watchedMarks[0].serialize(), {
      providerId: 'episode-0-1',
      type: 'episode',
      season: 0,
      episode: 1,
      duration: 28,
    })

    await user.refresh()
    assert.equal(user.watchedTime, 28)

    await browserContext.loginAs(user)
    const detailsPage = await visit(`/app/library/series/${serie.id}`)
    await detailsPage.assertTextContains('body', '1 / 1 watched')
    await detailsPage.assertTextContains('body', '0 / 2 watched')

    await client
      .delete(`/api/library/series/${serie.id}/seasons/0/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    assert.lengthOf(
      await WatchedEpisode.query().where('userId', user.id).where('libraryEntryId', serie.id),
      0
    )

    await user.refresh()
    assert.equal(user.watchedTime, 0)
  })

  test('authenticated users cannot mark unreleased episodes as watched', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Future Series',
      email: 'future-series@example.com',
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

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/2/watch`)
      .loginAs(user)
      .withCsrfToken()

    assert.lengthOf(
      await WatchedEpisode.query().where('userId', user.id).where('libraryEntryId', serie.id),
      0
    )
  })
})
