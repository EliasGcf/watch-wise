import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('User profile', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('authenticated users can set their username', async ({ assert, client }) => {
    const user = await User.create({
      fullName: 'Profile Owner',
      email: 'profile-owner@example.com',
      password: 'secret123',
    })

    const response = await client
      .patch('/api/user')
      .json({ username: 'ProfileOwner' })
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    response.assertBodyContains({ data: { username: 'profileowner' } })

    await user.refresh()
    assert.equal(user.username, 'profileowner')
  })

  test('usernames are unique regardless of case', async ({ client }) => {
    const first = await User.create({
      fullName: 'First User',
      email: 'first-user@example.com',
      password: 'secret123',
    })
    const second = await User.create({
      fullName: 'Second User',
      email: 'second-user@example.com',
      password: 'secret123',
    })

    await client.patch('/api/user').json({ username: 'taken' }).loginAs(first).withCsrfToken()

    const response = await client
      .patch('/api/user')
      .json({ username: 'TAKEN' })
      .accept('application/json')
      .loginAs(second)
      .withCsrfToken()

    response.assertUnprocessableEntity()
  })

  test('a username cannot be removed once set', async ({ client }) => {
    const user = await User.create({
      fullName: 'Kept Username',
      email: 'kept-username@example.com',
      password: 'secret123',
      username: 'kept_username',
    })

    const response = await client.patch('/api/user').json({}).loginAs(user).withCsrfToken()

    response.assertUnprocessableEntity()
    response.assertBodyContains({
      errors: [{ field: 'username', message: 'Username cannot be removed.' }],
    })
  })

  test('users can log in with their username', async ({ visit }) => {
    await User.create({
      fullName: 'Username Login',
      email: 'username-login@example.com',
      password: 'secret123',
      username: 'johndoe',
    })

    const page = await visit('/app/login')
    await page.fill('#email', 'JohnDoe')
    await page.fill('#password', 'secret123')
    await page.click('button[type="submit"]')

    await page.assertPath('/app')
    await page.assertTextContains('body', 'The screen is waiting')
  })

  test('users can log in with their email', async ({ visit }) => {
    await User.create({
      fullName: 'Email Login',
      email: 'email-login@example.com',
      password: 'secret123',
    })

    const page = await visit('/app/login')
    await page.fill('#email', 'email-login@example.com')
    await page.fill('#password', 'secret123')
    await page.click('button[type="submit"]')

    await page.assertPath('/app')
    await page.assertTextContains('body', 'The screen is waiting')
  })
})
