import User from '#models/user'
import Movie from '#models/movie'
import Serie from '#models/serie'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Home', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('authenticated users with an empty library see useful next actions on /app', async ({
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Empty Viewer',
      email: 'empty-home@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const page = await visit('/app')
    await page.assertTextContains('body', 'The screen is waiting.')
    await page.assertTextContains('body', 'Watched Time')
    await page.assertTextContains('body', '0m')
    await page.assertTextContains('body', 'Your library is empty. Search the catalog to add your first title.')
    await page.assertTextContains('body', 'Movies')
    await page.assertTextContains('body', 'Series')

    const searchLink = page.getByRole('link', { name: 'Search the catalog' })
    await searchLink.click()
    await page.assertPath('/app/catalog/search')

    const homeAgain = await visit('/app')
    await homeAgain.getByRole('link', { name: 'View library' }).click()
    await homeAgain.assertPath('/app/library')
  })

  test('authenticated users with library entries see a populated home summary on /app', async ({
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Library Viewer',
      email: 'populated-home@example.com',
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
    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()

    await browserContext.loginAs(user)

    const page = await visit('/app')
    await page.assertTextContains('body', 'The screen is waiting.')
    await page.assertTextContains('body', 'Watched Time')
    await page.assertTextContains('body', '0m')
    await page.assertTextContains('body', 'Movies')
    await page.assertTextContains('body', 'Series')
    await page.assertTextContains('body', 'Up next from your library')
    await page.assertTextContains('body', 'Heat')
    await page.assertTextContains('body', 'Heat Vision and Jack')
  })
})
