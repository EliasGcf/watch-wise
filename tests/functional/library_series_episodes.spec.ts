import Serie from '#models/serie'
import { WatchedEpisode } from '#models/watched_mark'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Library series episodes', (group) => {
  group.each.setup(() => testUtils.db().truncate())

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

  test('authenticated users load provider-sourced episodes for a single season', async ({
    assert,
    browserContext,
    visit,
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

    await browserContext.loginAs(user)
    const page = await visit(`/api/library/series/${serie.id}/seasons/1/episodes`)
    const { data } = JSON.parse((await page.locator('body').textContent()) ?? '{}')

    assert.deepEqual(data, {
      episodes: [
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
      ],
    })
  })

  test('authenticated users can mark a released episode once and then unmark it', async ({
    assert,
    client,
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
      .post(`/app/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()
    await client
      .post(`/app/library/series/${serie.id}/seasons/1/episodes/1/watch`)
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
    const body = detailsResponse.body().data
    assert.deepInclude(body.episodes[0], {
      season: 1,
      episode: 1,
      watched: {
        watchedAt: watchedMarks[0].watchedAt.toISO(),
      },
    })

    await client
      .delete(`/app/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()

    assert.lengthOf(
      await WatchedEpisode.query().where('userId', user.id).where('libraryEntryId', serie.id),
      0
    )
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
      .post(`/app/library/series/${serie.id}/seasons/1/episodes/2/watch`)
      .loginAs(user)
      .withCsrfToken()

    assert.lengthOf(
      await WatchedEpisode.query().where('userId', user.id).where('libraryEntryId', serie.id),
      0
    )
  })
})
