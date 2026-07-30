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
    await libraryPage.assertTextContains('body', 'Heat')
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
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
      .delete(`/app/library/${movie.id}`)
      .loginAs(otherUser)
      .withCsrfToken()
    const serieResponse = await client
      .delete(`/app/library/${serie.id}`)
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
    await libraryPage.assertTextContains('body', 'Heat Vision and Jack')
    await libraryPage
      .getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
      .click()
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
