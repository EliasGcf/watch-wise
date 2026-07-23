import Movie from '#models/movie'
import { MovieWatchedMark } from '#models/watched_mark'
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
      bannerUrl: 'https://image.tmdb.org/t/p/w780/movie-1.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })

    await browserContext.loginAs(user)

    const libraryPage = await visit('/app/library')
    await libraryPage.getByRole('button', { name: 'Mark Heat as watched' }).click()

    const markedPage = await visit('/app/library')
    await markedPage.assertTextContains('body', 'Watched')

    const moviesWatched = await MovieWatchedMark.query()
      .where('userId', user.id)
      .where('libraryEntryId', movie.id)

    assert.lengthOf(moviesWatched, 1)
    assert.isNull(moviesWatched[0].season)
    assert.isNull(moviesWatched[0].episode)
    assert.equal(moviesWatched[0].duration, 170)
    assert.isTrue(moviesWatched[0].watchedAt <= DateTime.now())

    await markedPage.getByRole('button', { name: 'Unmark Heat as watched' }).click()

    assert.lengthOf(await MovieWatchedMark.query().where('userId', user.id).where('libraryEntryId', movie.id), 0)
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
      bannerUrl: 'https://image.tmdb.org/t/p/w780/movie-1.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    await browserContext.loginAs(user)

    const firstPage = await visit('/app/library')
    const duplicatePage = await visit('/app/library')
    await firstPage.getByRole('button', { name: 'Mark Heat as watched' }).click()
    await duplicatePage.getByRole('button', { name: 'Mark Heat as watched' }).click()

    await movie.merge({ name: 'Changed Heat', bannerUrl: null, summary: null }).save()

    const secondPage = await visit('/app/library')
    await secondPage.assertTextContains('body', 'Watched')

    const moviesWatched = await MovieWatchedMark.query()
      .where('userId', user.id)
      .where('libraryEntryId', movie.id)

    assert.lengthOf(moviesWatched, 1)
    assert.isTrue(moviesWatched[0].watchedAt <= DateTime.now())
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
      bannerUrl: null,
      releasedAt: DateTime.now().plus({ days: 1 }),
      summary: null,
    })

    await browserContext.loginAs(user)

    const page = await visit('/app/library')
    await page.getByRole('button', { name: 'Mark Future Heat as watched' }).click()

    assert.lengthOf(await MovieWatchedMark.query().where('userId', user.id).where('libraryEntryId', movie.id), 0)
  })
})
