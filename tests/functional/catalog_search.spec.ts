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
})
