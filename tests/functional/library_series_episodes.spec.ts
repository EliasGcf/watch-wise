import Serie from '#models/serie'
import { EpisodeWatchedMark } from '#models/watched_mark'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Library series episodes', (group) => {
  group.each.setup(() => testUtils.db().truncate())

  test('authenticated users can view provider-sourced seasons and released episodes for a series library entry', async ({
    assert,
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
    const page = await visit(`/api/library/series/${serie.id}/episodes`)
    const { data } = JSON.parse((await page.locator('body').textContent()) ?? '{}')

    assert.deepEqual(data, {
      id: serie.id,
      name: 'Heat Vision and Jack',
      seasons: [
        {
          season: 0,
          name: 'Specials',
          episodes: [
            {
              providerId: 'series-1:s0:e1',
              season: 0,
              episode: 1,
              name: 'Unaired Pilot',
              releasedAt: '1999-01-01',
              duration: 28,
              summary: 'The original special episode.',
              isReleased: true,
              isSpecial: true,
              watched: null,
            },
          ],
        },
        {
          season: 1,
          name: 'Season 1',
          episodes: [
            {
              providerId: 'series-1:s1:e1',
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
              providerId: 'series-1:s1:e2',
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
      .post(`/app/library/${serie.id}/seasons/1/episodes/1/watched`)
      .loginAs(user)
      .withCsrfToken()
    await client
      .post(`/app/library/${serie.id}/seasons/1/episodes/1/watched`)
      .loginAs(user)
      .withCsrfToken()

    const watchedMarks = await EpisodeWatchedMark.query()
      .where('userId', user.id)
      .where('libraryEntryId', serie.id)

    assert.lengthOf(watchedMarks, 1)
    assert.include(watchedMarks[0].serialize(), {
      providerId: 'series-1:s1:e1',
      season: 1,
      episode: 1,
      name: 'Pilot',
      releasedAt: '1999-01-01',
      duration: 24,
    })
    assert.isTrue(watchedMarks[0].watchedAt <= DateTime.now())

    await serie.merge({ providerId: 'series-1-changed' }).save()
    const persistedSnapshot = await EpisodeWatchedMark.query()
      .where('userId', user.id)
      .where('libraryEntryId', serie.id)
      .firstOrFail()
    assert.include(persistedSnapshot.serialize(), {
      providerId: 'series-1:s1:e1',
      name: 'Pilot',
      releasedAt: '1999-01-01',
      duration: 24,
    })

    const detailsResponse = await client
      .get(`/api/library/series/${serie.id}/episodes`)
      .loginAs(user)
    detailsResponse.assertOk()
    const body = detailsResponse.body().data
    assert.deepInclude(body.seasons[1].episodes[0], {
      season: 1,
      episode: 1,
      watched: {
        watchedAt: watchedMarks[0].watchedAt.toISO(),
      },
    })

    await client
      .delete(`/app/library/${serie.id}/seasons/1/episodes/1/watched`)
      .loginAs(user)
      .withCsrfToken()

    assert.lengthOf(
      await EpisodeWatchedMark.query().where('userId', user.id).where('libraryEntryId', serie.id),
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
      .post(`/app/library/${serie.id}/seasons/1/episodes/2/watched`)
      .loginAs(user)
      .withCsrfToken()

    assert.lengthOf(
      await EpisodeWatchedMark.query().where('userId', user.id).where('libraryEntryId', serie.id),
      0
    )
  })
})
