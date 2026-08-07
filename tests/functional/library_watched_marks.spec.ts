import Movie from '#models/movie'
import { WatchedMovie } from '#models/watched_mark'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import type { Page } from 'playwright'

test.group('Library movie watched records', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('authenticated users can mark a library movie as watched once and then unmark it', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Morgan Viewer',
      email: 'morgan-watched@example.com',
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

    await browserContext.loginAs(user)

    const libraryPage = await visit('/app/library')
    await delayMovieWatchApi(libraryPage)
    const markCheckbox = libraryPage.getByRole('checkbox', { name: 'Mark Heat as watched' })
    await libraryPage.assertExists(markCheckbox)
    const markedResponse = libraryPage.waitForResponse('**/api/library/movies/*/watch')
    await markCheckbox.click()
    await markedResponse

    const markedPage = await visit('/app/library')
    await markedPage.assertExists(
      markedPage.getByRole('checkbox', { name: 'Unmark Heat as watched' })
    )
    await markedPage.assertTextContains('body', '2h 50m')
    await markedPage.assertTextContains(
      'body',
      'Watched Time from known movie and episode runtimes.'
    )

    const moviesWatched = await WatchedMovie.query()
      .where('userId', user.id)
      .where('libraryEntryId', movie.id)

    assert.lengthOf(moviesWatched, 1)
    assert.equal(moviesWatched[0].type, 'movie')
    assert.isNull(moviesWatched[0].season)
    assert.isNull(moviesWatched[0].episode)
    assert.equal(moviesWatched[0].duration, 170)
    assert.isTrue(moviesWatched[0].watchedAt <= DateTime.now())

    await user.refresh()
    assert.equal(user.watchedTime, 170)

    await delayMovieWatchApi(markedPage)
    const unmarkCheckbox = markedPage.getByRole('checkbox', { name: 'Unmark Heat as watched' })
    const unmarkedResponse = markedPage.waitForResponse('**/api/library/movies/*/watch')
    await unmarkCheckbox.click()
    await unmarkedResponse
    await markedPage.assertExists(
      markedPage.getByRole('checkbox', { name: 'Mark Heat as watched' })
    )

    assert.lengthOf(
      await WatchedMovie.query().where('userId', user.id).where('libraryEntryId', movie.id),
      0
    )

    await user.refresh()
    assert.equal(user.watchedTime, 0)
  })

  test('re-marking a movie preserves a single movie watched record', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Taylor Viewer',
      email: 'taylor-watched@example.com',
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
    await browserContext.loginAs(user)

    const firstPage = await visit('/app/library')
    const duplicatePage = await visit('/app/library')
    await firstPage.getByRole('checkbox', { name: 'Mark Heat as watched' }).click()
    await duplicatePage.getByRole('checkbox', { name: 'Mark Heat as watched' }).click()

    await movie
      .merge({ name: 'Changed Heat', bannerPath: '', posterPath: '', summary: null })
      .save()

    const secondPage = await visit('/app/library')
    await secondPage.assertExists(
      secondPage.getByRole('checkbox', { name: 'Unmark Changed Heat as watched' })
    )

    const moviesWatched = await WatchedMovie.query()
      .where('userId', user.id)
      .where('libraryEntryId', movie.id)

    assert.lengthOf(moviesWatched, 1)
    assert.isTrue(moviesWatched[0].watchedAt <= DateTime.now())

    await user.refresh()
    assert.equal(user.watchedTime, 170)
  })

  test('authenticated users cannot mark unreleased library movies as watched', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Future Viewer',
      email: 'future-watched@example.com',
      password: 'secret123',
    })
    const movie = await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Future Heat',
      bannerPath: '/movie-future.jpg',
      posterPath: '/movie-future-poster.jpg',
      releasedAt: DateTime.now().plus({ days: 1 }),
      summary: null,
    })

    await browserContext.loginAs(user)

    const page = await visit('/app/library')
    await page.getByRole('checkbox', { name: 'Mark Future Heat as watched' }).click()
    await page.assertTextContains('body', 'Movie could not be marked as watched.')

    assert.lengthOf(
      await WatchedMovie.query().where('userId', user.id).where('libraryEntryId', movie.id),
      0
    )
  })

  test('authenticated users cannot mark another user movie as watched', async ({
    assert,
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Movie',
      email: 'owner-movie-watch@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Movie',
      email: 'other-movie-watch@example.com',
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

    const response = await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .loginAs(otherUser)
      .withCsrfToken()

    response.assertNotFound()
    assert.lengthOf(await WatchedMovie.query().where('libraryEntryId', movie.id), 0)
    await owner.refresh()
    await otherUser.refresh()
    assert.equal(owner.watchedTime, 0)
    assert.equal(otherUser.watchedTime, 0)
  })

  test('authenticated users cannot unmark another user movie as watched', async ({
    assert,
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Unwatch',
      email: 'owner-movie-unwatch@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Unwatch',
      email: 'other-movie-unwatch@example.com',
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
    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(owner).withCsrfToken()

    const response = await client
      .delete(`/api/library/movies/${movie.id}/watch`)
      .loginAs(otherUser)
      .withCsrfToken()

    response.assertNotFound()
    assert.lengthOf(
      await WatchedMovie.query().where('userId', owner.id).where('libraryEntryId', movie.id),
      1
    )
    await owner.refresh()
    await otherUser.refresh()
    assert.equal(owner.watchedTime, 170)
    assert.equal(otherUser.watchedTime, 0)
  })
})

async function delayMovieWatchApi(page: Page) {
  await page.route('**/api/library/movies/*/watch', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    await route.continue()
  })
}
