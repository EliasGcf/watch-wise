import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import type { Page } from 'playwright'

test.group('Catalog search', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('authenticated users can search movie and series titles', async ({
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Taylor Viewer',
      email: 'taylor@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const page = await visit('/app/catalog/search?q=heat')

    await page.assertTextContains('body', 'MOVIE')
    await page.assertTextContains('body', 'SERIE')
    await page.assertExists(page.getByRole('button', { name: 'Add Heat to your library' }))
    await page.assertExists(
      page.getByRole('button', { name: 'Add Heat Vision and Jack to your library' })
    )
  })

  test('authenticated users can filter catalog results by type', async ({
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Taylor Filter',
      email: 'taylor-filter@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const moviePage = await visit('/app/catalog/search?q=heat&type=movie')
    await moviePage.assertExists(moviePage.getByRole('link', { name: 'Heat', exact: true }))
    await moviePage.assertNotExists(
      moviePage.getByRole('link', { name: 'Heat Vision and Jack', exact: true })
    )

    const seriesPage = await visit('/app/catalog/search?q=heat&type=serie')
    await seriesPage.assertExists(
      seriesPage.getByRole('link', { name: 'Heat Vision and Jack', exact: true })
    )
    await seriesPage.assertNotExists(seriesPage.getByRole('link', { name: 'Heat', exact: true }))
  })

  test('authenticated users see default titles when no search query is provided', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Taylor Browser',
      email: 'browse@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const page = await visit('/app/catalog/search')

    await page.assertExists(page.getByRole('button', { name: 'Add Heat to your library' }))
    await page.assertExists(
      page.getByRole('button', { name: 'Add Heat Vision and Jack to your library' })
    )
    assert.equal(
      await page.getByRole('link', { name: 'Heat Vision and Jack' }).getAttribute('href'),
      'http://seerr.local/tv/series-1'
    )
  })

  test('provider failures are shown as catalog search limitations', async ({
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Casey Viewer',
      email: 'casey@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const page = await visit('/app/catalog/search?q=fail')

    await page.assertTextContains('body', 'Catalog search is temporarily limited. Try again later.')
  })

  test('authenticated users can add movie titles from catalog search to their library', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Morgan Viewer',
      email: 'morgan@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const searchPage = await visit('/app/catalog/search?q=heat')
    await searchPage.getByRole('button', { name: 'Add Heat to your library' }).click()
    await searchPage.assertPath('/app/catalog/search')

    const libraryPage = await visit('/app/library')

    await libraryPage.assertExists(
      libraryPage.getByRole('button', { name: 'Remove Heat from library' })
    )

    const movie = await user.related('movies').query().where('providerId', 'movie-1').firstOrFail()
    assert.include(movie.serialize(), {
      provider: 'tmdb',
      providerId: 'movie-1',
      type: 'movie',
      name: 'Heat',
    })
  })

  test('authenticated users can add series titles from catalog search to their library', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Riley Viewer',
      email: 'riley@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const searchPage = await visit('/app/catalog/search?q=heat')
    await searchPage
      .getByRole('button', { name: 'Add Heat Vision and Jack to your library' })
      .click()
    await searchPage.assertPath('/app/catalog/search')

    const libraryPage = await visit('/app/library')

    await libraryPage.assertExists(
      libraryPage.getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
    )

    const serie = await user.related('series').query().where('providerId', 'series-1').firstOrFail()
    assert.include(serie.serialize(), {
      provider: 'tmdb',
      providerId: 'series-1',
      type: 'serie',
      name: 'Heat Vision and Jack',
    })
  })

  test('users cannot create duplicate library entries for the same provider title', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Jamie Viewer',
      email: 'jamie@example.com',
      password: 'secret123',
    })

    const payload = { provider: 'tmdb', providerId: 'movie-1', type: 'movie' }
    const firstResponse = await client
      .post('/api/library')
      .loginAs(user)
      .withCsrfToken()
      .json(payload)
    const secondResponse = await client
      .post('/api/library')
      .loginAs(user)
      .withCsrfToken()
      .json(payload)

    firstResponse.assertCreated()
    secondResponse.assertConflict()
    assert.lengthOf(await user.related('movies').query().where('providerId', 'movie-1'), 1)
  })

  test('duplicate checks do not treat another user library entry as current user library entry', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const existingUser = await User.create({
      fullName: 'Existing Viewer',
      email: 'existing-library@example.com',
      password: 'secret123',
    })
    const addingUser = await User.create({
      fullName: 'Adding Viewer',
      email: 'adding-library@example.com',
      password: 'secret123',
    })

    await existingUser.related('movies').create({
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: null,
      summary: 'A professional thief and a relentless detective collide.',
    })

    await browserContext.loginAs(addingUser)

    const searchPage = await visit('/app/catalog/search?q=heat')
    await searchPage.getByRole('button', { name: 'Add Heat to your library' }).click()

    assert.lengthOf(await existingUser.related('movies').query().where('providerId', 'movie-1'), 1)
    assert.lengthOf(await addingUser.related('movies').query().where('providerId', 'movie-1'), 1)
  })

  test('series duplicate checks do not treat another user library entry as current user library entry', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const existingUser = await User.create({
      fullName: 'Existing Series Viewer',
      email: 'existing-series-library@example.com',
      password: 'secret123',
    })
    const addingUser = await User.create({
      fullName: 'Adding Series Viewer',
      email: 'adding-series-library@example.com',
      password: 'secret123',
    })

    await existingUser.related('series').create({
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: null,
      summary: 'A pilot about a super-intelligent astronaut.',
    })

    await browserContext.loginAs(addingUser)

    const searchPage = await visit('/app/catalog/search?q=heat')
    await searchPage
      .getByRole('button', { name: 'Add Heat Vision and Jack to your library' })
      .click()

    assert.lengthOf(await existingUser.related('series').query().where('providerId', 'series-1'), 1)
    assert.lengthOf(await addingUser.related('series').query().where('providerId', 'series-1'), 1)
  })

  test('catalog search shows items already in the library as such', async ({
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Drew Viewer',
      email: 'drew@example.com',
      password: 'secret123',
    })

    await user.related('movies').create({
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })

    await browserContext.loginAs(user)

    const searchPage = await visit('/app/catalog/search?q=heat')
    await searchPage.assertExists(
      searchPage.getByRole('button', { name: 'Remove Heat from library' })
    )
    await searchPage.assertExists(
      searchPage.getByRole('checkbox', { name: 'Mark Heat as watched' })
    )
    await searchPage.assertElementsCount(
      searchPage.getByRole('button', { name: /Add .* to your library/ }),
      2
    )

    await delayMovieWatchApi(searchPage)
    const watchResponse = searchPage.waitForResponse('**/api/library/movies/*/watch')
    await searchPage.getByRole('checkbox', { name: 'Mark Heat as watched' }).click()
    await watchResponse
    await searchPage.assertExists(
      searchPage.getByRole('button', { name: 'Remove Heat from library' })
    )
    await searchPage.assertExists(
      searchPage.getByRole('checkbox', { name: 'Unmark Heat as watched' })
    )
  })

  test('authenticated users can add generated catalog titles to their library', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Avery Viewer',
      email: 'avery@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const searchPage = await visit('/app/catalog/search?q=heat')
    await searchPage.getByRole('button', { name: 'Add Unknown Heat to your library' }).click()
    await searchPage.assertPath('/app/catalog/search')

    const libraryPage = await visit('/app/library')

    await libraryPage.assertExists(
      libraryPage.getByRole('button', { name: 'Remove Unknown Heat from library' })
    )

    const movie = await user.related('movies').query().where('providerId', 'movie-2').firstOrFail()
    assert.include(movie.serialize(), {
      provider: 'tmdb',
      providerId: 'movie-2',
      type: 'movie',
      name: 'Unknown Heat',
      bannerPath: 'movie-2.jpg',
      posterPath: 'movie-2-poster.jpg',
      summary: 'A fake generated movie result.',
    })
    assert.equal(movie.releasedAt?.toISODate(), '2000-01-01')
  })
})

async function delayMovieWatchApi(page: Page) {
  await page.route('**/api/library/movies/*/watch', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 100))
    await route.continue()
  })
}
