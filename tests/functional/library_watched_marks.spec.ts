import Movie from '#models/movie'
import { WatchedMovie } from '#models/watched_mark'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Library movie watched records', (group) => {
  group.each.setup(() => testUtils.db().truncate())

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
    await libraryPage.getByRole('button', { name: 'Mark Heat as watched' }).click()

    const markedPage = await visit('/app/library')
    await markedPage.assertTextContains('body', 'Watched')
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

    await markedPage.getByRole('button', { name: 'Unmark Heat as watched' }).click()
    await markedPage.assertTextContains('body', 'Mark as watched')

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
    await firstPage.getByRole('button', { name: 'Mark Heat as watched' }).click()
    await duplicatePage.getByRole('button', { name: 'Mark Heat as watched' }).click()

    await movie
      .merge({ name: 'Changed Heat', bannerPath: '', posterPath: '', summary: null })
      .save()

    const secondPage = await visit('/app/library')
    await secondPage.assertTextContains('body', 'Watched')

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
      providerId: 'movie-future',
      name: 'Future Heat',
      bannerPath: '/movie-future.jpg',
      posterPath: '/movie-future-poster.jpg',
      releasedAt: DateTime.now().plus({ days: 1 }),
      summary: null,
    })

    await browserContext.loginAs(user)

    const page = await visit('/app/library')
    await page.getByRole('button', { name: 'Mark Future Heat as watched' }).click()

    assert.lengthOf(
      await WatchedMovie.query().where('userId', user.id).where('libraryEntryId', movie.id),
      0
    )
  })
})
