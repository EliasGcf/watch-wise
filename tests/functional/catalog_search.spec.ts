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
    await searchPage.getByRole('button', { name: 'Add Heat to library' }).click()

    const libraryPage = await visit('/app/library')

    await libraryPage.assertTextContains('body', 'Heat')
    await libraryPage.assertTextContains('body', 'movie')
    await libraryPage.assertTextContains('body', '1995')

    assert.containsSubset(await user.related('libraryEntries').query(), [
      {
        provider: 'tmdb',
        providerId: 'movie-1',
        type: 'movie',
        name: 'Heat',
      },
    ])
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
    await searchPage.getByRole('button', { name: 'Add Heat Vision and Jack to library' }).click()

    const libraryPage = await visit('/app/library')

    await libraryPage.assertTextContains('body', 'Heat Vision and Jack')
    await libraryPage.assertTextContains('body', 'series')
    await libraryPage.assertTextContains('body', '1999')

    assert.containsSubset(await user.related('libraryEntries').query(), [
      {
        provider: 'tmdb',
        providerId: 'series-1',
        type: 'series',
        name: 'Heat Vision and Jack',
      },
    ])
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
    await firstSearchPage.getByRole('button', { name: 'Add Heat to library' }).click()

    const secondSearchPage = await visit('/app/catalog/search?q=heat')
    await secondSearchPage.getByRole('button', { name: 'Add Heat to library' }).click()

    const libraryPage = await visit('/app/library')

    await libraryPage.assertTextContains('body', 'Heat')
    assert.lengthOf(await user.related('libraryEntries').query().where('providerId', 'movie-1'), 1)
  })

  test('authenticated users can add titles without optional catalog metadata', async ({
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
    await searchPage.getByRole('button', { name: 'Add Unknown Heat to library' }).click()

    const libraryPage = await visit('/app/library')

    await libraryPage.assertTextContains('body', 'Unknown Heat')
    await libraryPage.assertTextContains('body', 'movie')

    assert.containsSubset(await user.related('libraryEntries').query(), [
      {
        provider: 'tmdb',
        providerId: 'movie-2',
        type: 'movie',
        name: 'Unknown Heat',
        bannerUrl: null,
        releaseYear: null,
        summary: null,
      },
    ])
  })
})
