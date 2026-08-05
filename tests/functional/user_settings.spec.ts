import User from '#models/user'
import UserSettings from '#models/user_settings'
import app from '@adonisjs/core/services/app'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

test.group('User settings', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.setup(() => {
    const sonarrDriver = app.config.get('sonarr_provider.default')
    const radarrDriver = app.config.get('radarr_provider.default')

    return () => {
      app.config.set('sonarr_provider.default', sonarrDriver)
      app.config.set('radarr_provider.default', radarrDriver)
    }
  })

  test('authenticated users get default provider-action settings', async ({ assert, client }) => {
    const user = await User.create({
      fullName: 'Default Settings',
      email: 'default-settings@example.com',
      password: 'secret123',
    })

    const response = await client.get('/api/user/settings').loginAs(user)

    response.assertOk()
    response.assertBodyContains({
      data: {
        deleteSonarrEpisodeFiles: false,
        deleteRadarrMovieFiles: false,
        activeProviderActions: {
          deleteSonarrEpisodeFiles: false,
          deleteRadarrMovieFiles: false,
        },
      },
    })
    assert.lengthOf(await UserSettings.query().where('userId', user.id), 1)
  })

  test('authenticated users can persist available provider-action settings', async ({ assert, client }) => {
    const user = await User.create({
      fullName: 'Persist Settings',
      email: 'persist-settings@example.com',
      password: 'secret123',
    })

    app.config.set('sonarr_provider.default', 'fake')
    app.config.set('radarr_provider.default', 'fake')

    const response = await client
      .patch('/api/user/settings')
      .json({ deleteSonarrEpisodeFiles: true })
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    response.assertBodyContains({
      data: {
        deleteSonarrEpisodeFiles: true,
        deleteRadarrMovieFiles: false,
        activeProviderActions: {
          deleteSonarrEpisodeFiles: true,
          deleteRadarrMovieFiles: false,
        },
      },
    })

    const settings = await user.getSettings()
    assert.isTrue(Boolean(settings.deleteSonarrEpisodeFiles))
    assert.isFalse(Boolean(settings.deleteRadarrMovieFiles))
  })

  test('settings updates reject enabling unavailable provider actions', async ({ assert, client }) => {
    const user = await User.create({
      fullName: 'Blocked Settings',
      email: 'blocked-settings@example.com',
      password: 'secret123',
    })

    app.config.set('sonarr_provider.default', undefined)
    app.config.set('radarr_provider.default', undefined)

    const response = await client
      .patch('/api/user/settings')
      .json({ deleteSonarrEpisodeFiles: true, deleteRadarrMovieFiles: true })
      .loginAs(user)
      .withCsrfToken()

    response.assertUnprocessableEntity()
    assert.deepInclude(response.body().errors, {
      field: 'deleteSonarrEpisodeFiles',
      message: 'Sonarr is not available.',
    })
    assert.deepInclude(response.body().errors, {
      field: 'deleteRadarrMovieFiles',
      message: 'Radarr is not available.',
    })

    const settings = await user.getSettings()
    assert.isFalse(Boolean(settings.deleteSonarrEpisodeFiles))
    assert.isFalse(Boolean(settings.deleteRadarrMovieFiles))
  })

  test('unavailable provider actions keep saved values but are inactive', async ({ assert, client }) => {
    const user = await User.create({
      fullName: 'Inactive Settings',
      email: 'inactive-settings@example.com',
      password: 'secret123',
    })
    await UserSettings.create({
      userId: user.id,
      deleteSonarrEpisodeFiles: true,
      deleteRadarrMovieFiles: true,
    })

    app.config.set('sonarr_provider.default', undefined)
    app.config.set('radarr_provider.default', undefined)

    const response = await client.get('/api/user/settings').loginAs(user)

    response.assertOk()
    response.assertBodyContains({
      data: {
        deleteSonarrEpisodeFiles: true,
        deleteRadarrMovieFiles: true,
        activeProviderActions: {
          deleteSonarrEpisodeFiles: false,
          deleteRadarrMovieFiles: false,
        },
      },
    })

    const settings = await user.getSettings()
    assert.isTrue(Boolean(settings.deleteSonarrEpisodeFiles))
    assert.isTrue(Boolean(settings.deleteRadarrMovieFiles))
  })
})
