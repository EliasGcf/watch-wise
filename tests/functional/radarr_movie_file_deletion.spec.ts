import Movie from '#models/movie'
import User from '#models/user'
import UserSettings from '#models/user_settings'
import emitter from '@adonisjs/core/services/emitter'
import testUtils from '@adonisjs/core/services/test_utils'
import { events } from '#generated/events'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'

test.group('Radarr movie file deletion', (group) => {
  let buffer: ReturnType<typeof emitter.fake>

  group.each.setup(() => {
    buffer = emitter.fake([events.MovieWatched])
    return () => emitter.restore()
  })

  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('deletes the Radarr movie file when enabled and available', async ({ client }) => {
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })

    const response = await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    buffer.assertEmitted(events.MovieWatched, (event) =>
      matchesMovieWatchedEvent(event, user, movie, false)
    )
  })

  test('does not delete when setting is disabled', async ({ client }) => {
    const { user, movie } = await makeUserWithMovie()

    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()

    buffer.assertEmitted(events.MovieWatched, (event) =>
      matchesMovieWatchedEvent(event, user, movie, false)
    )
  })

  test('deletes the Radarr movie file when deleteFile is requested even with setting disabled', async ({
    client,
  }) => {
    const { user, movie } = await makeUserWithMovie()

    const response = await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()

    response.assertOk()
    buffer.assertEmitted(events.MovieWatched, (event) =>
      matchesMovieWatchedEvent(event, user, movie, true)
    )
  })

  test('does not retry deletion when already watched movie is requested with deleteFile', async ({
    client,
  }) => {
    const { user, movie } = await makeUserWithMovie()

    await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()
    await client
      .post(`/api/library/movies/${movie.id}/watch`)
      .json({ deleteFile: true })
      .loginAs(user)
      .withCsrfToken()

    buffer.assertEmittedCount(events.MovieWatched, 1)
    buffer.assertEmitted(events.MovieWatched, (event) =>
      matchesMovieWatchedEvent(event, user, movie, true)
    )
  })

  test('does not retry deletion when movie is already watched', async ({ client }) => {
    const { user, movie } = await makeUserWithMovie()
    await UserSettings.create({ userId: user.id, deleteRadarrMovieFiles: true })

    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()
    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()

    buffer.assertEmittedCount(events.MovieWatched, 1)
    buffer.assertEmitted(events.MovieWatched, (event) =>
      matchesMovieWatchedEvent(event, user, movie, false)
    )
  })
})

function matchesMovieWatchedEvent(
  event: { data: InstanceType<typeof events.MovieWatched> },
  user: User,
  movie: Movie,
  deleteFile: boolean
) {
  return (
    event.data.watched.userId === user.id &&
    event.data.watched.libraryEntryId === movie.id &&
    event.data.watched.providerId === movie.providerId &&
    event.data.deleteFile === deleteFile
  )
}

async function makeUserWithMovie() {
  const user = await User.create({
    fullName: 'Radarr Action',
    email: `radarr-action-${crypto.randomUUID()}@example.com`,
    password: 'secret123',
  })
  const movie = await Movie.create({
    userId: user.id,
    provider: 'tmdb',
    providerId: 'movie-1',
    name: 'Heat',
    bannerPath: '/movie-1.jpg',
    posterPath: '/movie-1-poster.jpg',
    releasedAt: DateTime.fromISO('1995-12-15'),
    summary: 'professional thief and relentless detective collide.',
  })

  return { user, movie }
}
