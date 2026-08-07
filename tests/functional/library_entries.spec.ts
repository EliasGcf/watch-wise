import Movie from '#models/movie'
import Serie from '#models/serie'
import User from '#models/user'
import { WatchedEpisode, WatchedMovie } from '#models/watched_mark'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Library entries', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('library entries save image paths relative to the configured image base URL', async ({
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Path Viewer',
      email: 'path-viewer@example.com',
      password: 'secret123',
    })

    const movie = await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Path Movie',
      bannerPath: '/movie-paths.jpg',
      posterPath: '/movie-paths-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: null,
    })

    assert.include(movie.serialize(), {
      bannerPath: 'movie-paths.jpg',
      posterPath: 'movie-paths-poster.jpg',
      bannerUrl: 'http://localhost:3000/images/movie-paths.jpg',
      posterUrl: 'http://localhost:3000/images/movie-paths-poster.jpg',
    })
  })

  test('authenticated users can remove a movie library entry from their library', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Morgan Viewer',
      email: 'morgan-remove-movie@example.com',
      password: 'secret123',
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })

    await browserContext.loginAs(user)

    const libraryPage = await visit('/app/library')
    await libraryPage.assertExists(
      libraryPage.getByRole('button', { name: 'Remove Heat from library' })
    )
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No movies in your library yet.')

    assert.lengthOf(await Movie.query().where('userId', user.id), 0)
  })

  test('authenticated users cannot view another user library entries or watched time', async ({
    assert,
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Viewer',
      email: 'owner-library-view@example.com',
      password: 'secret123',
    })
    const viewer = await User.create({
      fullName: 'Other Viewer',
      email: 'other-library-view@example.com',
      password: 'secret123',
    })
    const movie = await Movie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
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
    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(owner).withCsrfToken()
    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(owner)
      .withCsrfToken()

    const response = await client.get('/app/library').loginAs(viewer)
    response.assertOk()

    const page = JSON.parse(
      response
        .text()
        .match(/data-page="([^"]+)"/)![1]
        .replaceAll('&quot;', '"')
    ).props
    assert.deepEqual(page.movies, [])
    assert.deepEqual(page.series, [])
    assert.equal(page.user.watchedTime, 0)
  })

  test('authenticated users can search their own library entries', async ({ assert, client }) => {
    const user = await User.create({
      fullName: 'Library Searcher',
      email: 'library-searcher@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Searcher',
      email: 'other-searcher@example.com',
      password: 'secret123',
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Severance',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('2022-02-18'),
      summary: 'Work and life are surgically divided.',
    })
    await Movie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'movie-2',
      name: 'Heat Wave',
      bannerPath: '/movie-2.jpg',
      posterPath: '/movie-2-poster.jpg',
      releasedAt: DateTime.fromISO('1991-08-13'),
      summary: null,
    })

    const response = await client.get('/app/library?q=heat').loginAs(user)
    response.assertOk()

    const page = JSON.parse(
      response
        .text()
        .match(/data-page="([^"]+)"/)![1]
        .replaceAll('&quot;', '"')
    ).props
    assert.equal(page.query, 'heat')
    assert.deepEqual(
      page.movies.map((movie: { name: string }) => movie.name),
      ['Heat']
    )
    assert.deepEqual(page.series, [])
  })

  test('library summary limits movies and series to six entries with total counts', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Library Limiter',
      email: 'library-limiter@example.com',
      password: 'secret123',
    })

    for (let index = 1; index <= 8; index++) {
      await Movie.create({
        userId: user.id,
        provider: 'tmdb',
        providerId: `movie-${index}`,
        name: `Movie ${index}`,
        bannerPath: `/movie-${index}.jpg`,
        posterPath: `/movie-${index}-poster.jpg`,
        releasedAt: DateTime.fromISO('1995-12-15'),
        summary: null,
      })
      await Serie.create({
        userId: user.id,
        provider: `tmdb-${index}`,
        providerId: 'series-1',
        name: `Series ${index}`,
        bannerPath: `/series-${index}.jpg`,
        posterPath: `/series-${index}-poster.jpg`,
        releasedAt: DateTime.fromISO('2022-02-18'),
        summary: null,
      })
    }

    const response = await client.get('/app/library').loginAs(user)
    response.assertOk()

    const page = JSON.parse(
      response
        .text()
        .match(/data-page="([^"]+)"/)![1]
        .replaceAll('&quot;', '"')
    ).props
    assert.lengthOf(page.movies, 6)
    assert.lengthOf(page.series, 6)
    assert.equal(page.moviesCount, 8)
    assert.equal(page.seriesCount, 8)
  })

  test('authenticated users can search their dedicated movie library page', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Movie Searcher',
      email: 'movie-searcher@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Movie Searcher',
      email: 'other-movie-searcher@example.com',
      password: 'secret123',
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: null,
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-2',
      name: 'Thief',
      bannerPath: '/movie-2.jpg',
      posterPath: '/movie-2-poster.jpg',
      releasedAt: DateTime.fromISO('1981-03-27'),
      summary: null,
    })
    await Movie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'movie-3',
      name: 'Heat Wave',
      bannerPath: '/movie-3.jpg',
      posterPath: '/movie-3-poster.jpg',
      releasedAt: DateTime.fromISO('1991-08-13'),
      summary: null,
    })

    const response = await client.get('/app/library/movies?q=heat').loginAs(user)
    response.assertOk()

    const page = JSON.parse(
      response
        .text()
        .match(/data-page="([^"]+)"/)![1]
        .replaceAll('&quot;', '"')
    ).props
    assert.equal(page.query, 'heat')
    assert.deepEqual(
      page.movies.map((movie: { name: string }) => movie.name),
      ['Heat']
    )
  })

  test('authenticated users can search their dedicated series library page', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Series Searcher',
      email: 'series-searcher@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Series Searcher',
      email: 'other-series-searcher@example.com',
      password: 'secret123',
    })
    await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Severance',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('2022-02-18'),
      summary: null,
    })
    await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-2',
      name: 'The Bear',
      bannerPath: '/series-2.jpg',
      posterPath: '/series-2-poster.jpg',
      releasedAt: DateTime.fromISO('2022-06-23'),
      summary: null,
    })
    await Serie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'series-3',
      name: 'Severance Room',
      bannerPath: '/series-3.jpg',
      posterPath: '/series-3-poster.jpg',
      releasedAt: DateTime.fromISO('2020-01-01'),
      summary: null,
    })

    const response = await client.get('/app/library/series?q=severance').loginAs(user)
    response.assertOk()

    const page = JSON.parse(
      response
        .text()
        .match(/data-page="([^"]+)"/)![1]
        .replaceAll('&quot;', '"')
    ).props
    assert.equal(page.query, 'severance')
    assert.deepEqual(
      page.series.map((serie: { name: string }) => serie.name),
      ['Severance']
    )
  })

  test('authenticated users cannot remove another user library entries by id', async ({
    assert,
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Removal',
      email: 'owner-library-removal@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Removal',
      email: 'other-library-removal@example.com',
      password: 'secret123',
    })
    const movie = await Movie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
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

    const movieResponse = await client
      .delete(`/api/library/${movie.id}`)
      .loginAs(otherUser)
      .withCsrfToken()
    const serieResponse = await client
      .delete(`/api/library/${serie.id}`)
      .loginAs(otherUser)
      .withCsrfToken()

    movieResponse.assertNotFound()
    serieResponse.assertNotFound()
    assert.lengthOf(await Movie.query().where('userId', owner.id).where('id', movie.id), 1)
    assert.lengthOf(await Serie.query().where('userId', owner.id).where('id', serie.id), 1)
  })

  test('removing a watched movie library entry removes its watched mark and watched time', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Morgan Watched Removal',
      email: 'morgan-watched-removal@example.com',
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
      summary: 'A professional thief and a relentless detective collide.',
    })

    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()
    await user.refresh()
    assert.equal(user.watchedTime, 170)

    await browserContext.loginAs(user)
    const libraryPage = await visit('/app/library')
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No movies in your library yet.')

    assert.lengthOf(
      await WatchedMovie.query().where('userId', user.id).where('libraryEntryId', movie.id),
      0
    )
    await user.refresh()
    assert.equal(user.watchedTime, 0)
  })

  test('authenticated users can remove a series library entry from their library', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Riley Viewer',
      email: 'riley-remove-series@example.com',
      password: 'secret123',
    })
    await Serie.create({
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

    const libraryPage = await visit('/app/library')
    await libraryPage.assertExists(
      libraryPage.getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
    )
    await libraryPage
      .getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
      .click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No series in your library yet.')

    assert.lengthOf(await Serie.query().where('userId', user.id), 0)
  })

  test('removing a tracked series library entry removes episode marks and watched time', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Riley Watched Removal',
      email: 'riley-watched-removal@example.com',
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
    await user.refresh()
    assert.equal(user.watchedTime, 24)

    await browserContext.loginAs(user)
    const libraryPage = await visit('/app/library')
    await libraryPage
      .getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
      .click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No series in your library yet.')

    assert.lengthOf(
      await WatchedEpisode.query().where('userId', user.id).where('libraryEntryId', serie.id),
      0
    )
    await user.refresh()
    assert.equal(user.watchedTime, 0)
  })

  test('removing a movie library entry does not affect another user', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const removingUser = await User.create({
      fullName: 'Casey Viewer',
      email: 'casey-remove-library@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Taylor Viewer',
      email: 'taylor-keep-library@example.com',
      password: 'secret123',
    })
    await Movie.create({
      userId: removingUser.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    await Movie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })

    await browserContext.loginAs(removingUser)

    const libraryPage = await visit('/app/library')
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No movies in your library yet.')

    assert.lengthOf(await Movie.query().where('userId', removingUser.id), 0)
    assert.lengthOf(await Movie.query().where('userId', otherUser.id), 1)
  })

  test('removing a watched movie library entry does not affect another user watched mark', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const removingUser = await User.create({
      fullName: 'Casey Watched Removal',
      email: 'casey-watched-removal@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Taylor Watched Keep',
      email: 'taylor-watched-keep@example.com',
      password: 'secret123',
    })
    const removingMovie = await Movie.create({
      userId: removingUser.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    const otherMovie = await Movie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })

    await client
      .post(`/api/library/movies/${removingMovie.id}/watch`)
      .loginAs(removingUser)
      .withCsrfToken()
    await client
      .post(`/api/library/movies/${otherMovie.id}/watch`)
      .loginAs(otherUser)
      .withCsrfToken()

    await browserContext.loginAs(removingUser)
    const libraryPage = await visit('/app/library')
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No movies in your library yet.')

    assert.lengthOf(
      await WatchedMovie.query()
        .where('userId', removingUser.id)
        .where('libraryEntryId', removingMovie.id),
      0
    )
    assert.lengthOf(
      await WatchedMovie.query()
        .where('userId', otherUser.id)
        .where('libraryEntryId', otherMovie.id),
      1
    )
    await removingUser.refresh()
    await otherUser.refresh()
    assert.equal(removingUser.watchedTime, 0)
    assert.equal(otherUser.watchedTime, 170)
  })

  test('removing a series library entry does not affect another user', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const removingUser = await User.create({
      fullName: 'Avery Viewer',
      email: 'avery-remove-series@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Jordan Viewer',
      email: 'jordan-keep-series@example.com',
      password: 'secret123',
    })
    const removingSerie = await Serie.create({
      userId: removingUser.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })
    const otherSerie = await Serie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })
    await client
      .post(`/api/library/series/${removingSerie.id}/seasons/1/episodes/1/watch`)
      .loginAs(removingUser)
      .withCsrfToken()
    await client
      .post(`/api/library/series/${otherSerie.id}/seasons/1/episodes/1/watch`)
      .loginAs(otherUser)
      .withCsrfToken()

    await browserContext.loginAs(removingUser)

    const libraryPage = await visit('/app/library')
    await libraryPage
      .getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
      .click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No series in your library yet.')

    assert.lengthOf(await Serie.query().where('userId', removingUser.id), 0)
    assert.lengthOf(await Serie.query().where('userId', otherUser.id), 1)
    assert.lengthOf(
      await WatchedEpisode.query()
        .where('userId', removingUser.id)
        .where('libraryEntryId', removingSerie.id),
      0
    )
    assert.lengthOf(
      await WatchedEpisode.query()
        .where('userId', otherUser.id)
        .where('libraryEntryId', otherSerie.id),
      1
    )
    await removingUser.refresh()
    await otherUser.refresh()
    assert.equal(removingUser.watchedTime, 0)
    assert.equal(otherUser.watchedTime, 24)
  })
})
