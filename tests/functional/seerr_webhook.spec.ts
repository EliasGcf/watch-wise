import Movie from '#models/movie'
import Serie from '#models/serie'
import User from '#models/user'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'

type SeerrPayload = {
  notification_type: string
  media: { media_type: 'movie' | 'tv'; tmdbId: string }
  request: { requestedBy_username: string }
}

const SEERR_USERNAME = 'john-doe'
const SEERR_AUTH_HEADER = 'webhook-secret'

test.group('Seerr webhook', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('adds a movie to the seerr user library', async ({ assert, client }) => {
    await makeSeerrUser()
    const response = await client
      .post('/api/webhooks/seerr')
      .header('Authorization', SEERR_AUTH_HEADER)
      .json(seerrPayload('movie', 'movie-1'))

    response.assertCreated()
    const movie = await Movie.query()
      .where('provider', 'tmdb')
      .where('providerId', 'movie-1')
      .first()
    assert.equal(movie?.name, 'Heat')
  })

  test('adds a serie when media_type is tv', async ({ assert, client }) => {
    await makeSeerrUser()
    const response = await client
      .post('/api/webhooks/seerr')
      .header('Authorization', SEERR_AUTH_HEADER)
      .json(seerrPayload('tv', 'series-1'))

    response.assertCreated()
    const serie = await Serie.query()
      .where('provider', 'tmdb')
      .where('providerId', 'series-1')
      .first()
    assert.equal(serie?.name, 'Heat Vision and Jack')
  })

  test('ignores notification types other than MEDIA_AUTO_APPROVED', async ({ assert, client }) => {
    await makeSeerrUser()
    const response = await client
      .post('/api/webhooks/seerr')
      .header('Authorization', SEERR_AUTH_HEADER)
      .json(seerrPayload('movie', 'movie-1', 'MEDIA_APPROVED'))

    response.assertNoContent()
    assert.lengthOf(await Movie.query(), 0)
  })

  test('rejects requests with an invalid authorization header', async ({ assert, client }) => {
    await makeSeerrUser()
    const response = await client
      .post('/api/webhooks/seerr')
      .header('Authorization', 'wrong-secret')
      .json(seerrPayload('movie', 'movie-1'))

    response.assertUnauthorized()
    assert.lengthOf(await Movie.query(), 0)
  })

  test('rejects requests with an unknown requestedBy_username', async ({ assert, client }) => {
    await makeSeerrUser()
    const response = await client
      .post('/api/webhooks/seerr')
      .header('Authorization', SEERR_AUTH_HEADER)
      .json(seerrPayload('movie', 'movie-1', 'MEDIA_AUTO_APPROVED', 'somebody-else'))

    response.assertForbidden()
    assert.lengthOf(await Movie.query(), 0)
  })

  test('does not duplicate an existing library entry', async ({ assert, client }) => {
    await makeSeerrUser()
    const payload = seerrPayload('movie', 'movie-1')

    await client
      .post('/api/webhooks/seerr')
      .header('Authorization', SEERR_AUTH_HEADER)
      .json(payload)
    const response = await client
      .post('/api/webhooks/seerr')
      .header('Authorization', SEERR_AUTH_HEADER)
      .json(payload)

    response.assertNoContent()
    assert.lengthOf(await Movie.query(), 1)
  })

  test('returns 404 when the catalog cannot find the title', async ({ assert, client }) => {
    await makeSeerrUser()
    const response = await client
      .post('/api/webhooks/seerr')
      .header('Authorization', SEERR_AUTH_HEADER)
      .json(seerrPayload('movie', 'movie-unknown'))

    response.assertNotFound()
    assert.lengthOf(await Movie.query(), 0)
  })

  test('returns 500 when the seerr user does not exist', async ({ client }) => {
    const response = await client
      .post('/api/webhooks/seerr')
      .header('Authorization', SEERR_AUTH_HEADER)
      .json(seerrPayload('movie', 'movie-1'))

    response.assertStatus(500)
  })
})

function makeSeerrUser() {
  return User.create({
    username: SEERR_USERNAME,
    email: `webhook-${crypto.randomUUID()}@example.com`,
    password: 'secret123',
  })
}

function seerrPayload(
  mediaType: 'movie' | 'tv',
  tmdbId: string,
  notificationType = 'MEDIA_AUTO_APPROVED',
  requestedByUsername = SEERR_USERNAME
): SeerrPayload {
  return {
    notification_type: notificationType,
    media: { media_type: mediaType, tmdbId },
    request: { requestedBy_username: requestedByUsername },
  }
}
