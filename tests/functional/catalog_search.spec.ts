import {
  CatalogProvider,
  CatalogProviderError,
  type CatalogTitleResult,
} from '#services/catalog_provider'
import User from '#models/user'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'
import { test } from '@japa/runner'

class FakeCatalogProvider extends CatalogProvider {
  async search(query: string): Promise<CatalogTitleResult[]> {
    if (query === 'fail') {
      throw new CatalogProviderError('Provider unavailable')
    }

    return [
      {
        provider: 'tmdb',
        providerTitleId: 'movie-1',
        type: 'movie' as const,
        name: 'Heat',
        releaseYear: 1995,
        summary: 'A professional thief and a relentless detective collide.',
      },
      {
        provider: 'tmdb',
        providerTitleId: 'series-1',
        type: 'series' as const,
        name: 'Heat Vision and Jack',
        releaseYear: 1999,
        summary: 'A pilot about a super-intelligent astronaut.',
      },
    ]
  }
}

test.group('Catalog search', (group) => {
  group.each.setup(async () => {
    app.container.swap(CatalogProvider, () => new FakeCatalogProvider())
    await db.from('users').delete()

    return async () => {
      app.container.restore(CatalogProvider)
      await db.from('users').delete()
    }
  })

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
})
