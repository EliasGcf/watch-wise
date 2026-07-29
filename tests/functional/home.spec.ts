import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Home', (group) => {
  group.each.setup(() => testUtils.db().truncate())

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
    await page.assertTextContains('body', 'Start your library')
    await page.assertTextContains('body', 'Watched Time')
    await page.assertTextContains('body', '0m')
    await page.assertTextContains('body', 'Movies\n0')
    await page.assertTextContains('body', 'Series\n0')

    const searchLink = page.getByRole('link', { name: 'Search the catalog' })
    await searchLink.click()
    await page.assertPath('/app/catalog/search')

    const homeAgain = await visit('/app')
    await homeAgain.getByRole('link', { name: 'View library' }).click()
    await homeAgain.assertPath('/app/library')
  })
})
