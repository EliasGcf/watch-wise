import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Catalog search', (group) => {
  group.each.setup(() => testUtils.db().truncate())

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

    await page.assertTextContains('body', 'Heat')
    await page.assertTextContains('body', 'movie')
    await page.assertTextContains('body', '1995')
    await page.assertTextContains(
      'body',
      'A professional thief and a relentless detective collide.'
    )
    await page.assertTextContains('body', 'Heat Vision and Jack')
    await page.assertTextContains('body', 'series')
    await page.assertTextContains('body', '1999')
    await page.assertTextContains('body', 'A pilot about a super-intelligent astronaut.')
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
    await searchPage.getByRole('button', { name: 'Add to library' }).first().click()

    const libraryPage = await visit('/app/library')

    await libraryPage.assertTextContains('body', 'Heat')
    await libraryPage.assertTextContains('body', 'movie')

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
    await searchPage.getByRole('button', { name: 'Add to library' }).nth(1).click()

    const libraryPage = await visit('/app/library')

    await libraryPage.assertTextContains('body', 'Heat Vision and Jack')
    await libraryPage.assertTextContains('body', 'series')

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
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Jamie Viewer',
      email: 'jamie@example.com',
      password: 'secret123',
    })

    await browserContext.loginAs(user)

    const firstSearchPage = await visit('/app/catalog/search?q=heat')
    await firstSearchPage.getByRole('button', { name: 'Add to library' }).first().click()

    const secondSearchPage = await visit('/app/catalog/search?q=heat')
    await secondSearchPage.getByRole('button', { name: 'Add to library' }).first().click()

    const libraryPage = await visit('/app/library')

    await libraryPage.assertTextContains('body', 'Heat')
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
    await searchPage.getByRole('button', { name: 'Add to library' }).first().click()

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
    await searchPage.getByRole('button', { name: 'Add to library' }).nth(1).click()

    assert.lengthOf(await existingUser.related('series').query().where('providerId', 'series-1'), 1)
    assert.lengthOf(await addingUser.related('series').query().where('providerId', 'series-1'), 1)
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
    await searchPage.getByRole('button', { name: 'Add to library' }).nth(2).click()

    const libraryPage = await visit('/app/library')

    await libraryPage.assertTextContains('body', 'Unknown Heat')
    await libraryPage.assertTextContains('body', 'movie')

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
