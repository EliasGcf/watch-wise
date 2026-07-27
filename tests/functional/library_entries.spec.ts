import Movie from '#models/movie'
import Serie from '#models/serie'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Library entries', (group) => {
  group.each.setup(() => testUtils.db().truncate())

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

    assert.lengthOf(await Movie.query().where('userId', removingUser.id), 0)
    assert.lengthOf(await Movie.query().where('userId', otherUser.id), 1)
  })

  test('removing a series library entry does not affect another user', async ({
    assert,
    browserContext,
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
    await Serie.create({
      userId: removingUser.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })
    await Serie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })

    await browserContext.loginAs(removingUser)

    const libraryPage = await visit('/app/library')
    await libraryPage
      .getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
      .click()

    assert.lengthOf(await Serie.query().where('userId', removingUser.id), 0)
    assert.lengthOf(await Serie.query().where('userId', otherUser.id), 1)
  })
})
