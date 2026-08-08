import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('Debug unique', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('debug http unique', async ({ client, assert }) => {
    const first = await User.create({
      fullName: 'First',
      email: 'first@example.com',
      password: 'secret123',
    })
    const second = await User.create({
      fullName: 'Second',
      email: 'second@example.com',
      password: 'secret123',
    })

    const r1 = await client.patch('/api/user').json({ username: 'taken' }).loginAs(first).withCsrfToken()
    console.log('R1', r1.status(), JSON.stringify(r1.body()))

    const db1 = await User.findBy('username', 'taken')
    console.log('DB1', db1?.id, db1?.email)

    const r2 = await client.patch('/api/user').json({ username: 'TAKEN' }).loginAs(second).withCsrfToken()
    console.log('R2', r2.status(), JSON.stringify(r2.body()))
  })
})
