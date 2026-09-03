import { pagination } from '#config/pagination'
import Movie from '#models/movie'
import Serie from '#models/serie'
import User from '#models/user'
import { catalog } from '#services/catalog_provider'
import { WatchedEpisode, WatchedMovie } from '#models/watched_mark'
import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import sinon from 'sinon'

test.group('Library entries', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())
  group.each.teardown(() => sinon.restore())

  test('library entries save image paths relative to the configured image base URL', async ({
    assert,
  }) => {
    const user = await User.create({
      fullName: 'Path Viewer',
      email: 'path-viewer@example.com',
      password: 'secret123',
    })

    const movie = await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Path Movie',
      bannerPath: '/movie-paths.jpg',
      posterPath: '/movie-paths-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: null,
    })

    assert.containSubset(movie.serialize(), {
      bannerPath: 'movie-paths.jpg',
      posterPath: 'movie-paths-poster.jpg',
      bannerUrls: {
        sm: 'http://localhost:3000/images/movie-paths.jpg',
        md: 'http://localhost:3000/images/movie-paths.jpg',
        lg: 'http://localhost:3000/images/movie-paths.jpg',
        original: 'http://localhost:3000/images/movie-paths.jpg',
      },
      posterUrls: {
        sm: 'http://localhost:3000/images/movie-paths-poster.jpg',
        md: 'http://localhost:3000/images/movie-paths-poster.jpg',
        lg: 'http://localhost:3000/images/movie-paths-poster.jpg',
        original: 'http://localhost:3000/images/movie-paths-poster.jpg',
      },
    })
  })

  test('authenticated users can remove a movie library entry from their library', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Morgan Viewer',
      email: 'morgan-remove-movie@example.com',
      password: 'secret123',
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })

    await browserContext.loginAs(user)

    const libraryPage = await visit('/app/library')
    await libraryPage.assertExists(
      libraryPage.getByRole('button', { name: 'Remove Heat from library' })
    )
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No movies in your library yet.')

    assert.lengthOf(await Movie.query().where('userId', user.id), 0)
  })

  test('authenticated users cannot view another user library entries or watched time', async ({
    assert,
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Viewer',
      email: 'owner-library-view@example.com',
      password: 'secret123',
    })
    const viewer = await User.create({
      fullName: 'Other Viewer',
      email: 'other-library-view@example.com',
      password: 'secret123',
    })
    const movie = await Movie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    const serie = await Serie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })
    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(owner).withCsrfToken()
    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(owner)
      .withCsrfToken()

    const response = await client.get('/app/library').withInertia().loginAs(viewer)
    response.assertOk()

    const page = response.inertiaProps
    assert.deepEqual(page.movies, [])
    assert.deepEqual(page.series, [])
    assert.equal(page.user.watchedTime, 0)
  })

  test('authenticated users can search their own library entries', async ({ assert, client }) => {
    const user = await User.create({
      fullName: 'Library Searcher',
      email: 'library-searcher@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Searcher',
      email: 'other-searcher@example.com',
      password: 'secret123',
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Severance',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('2022-02-18'),
      summary: 'Work and life are surgically divided.',
    })
    await Movie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'movie-2',
      name: 'Heat Wave',
      bannerPath: '/movie-2.jpg',
      posterPath: '/movie-2-poster.jpg',
      releasedAt: DateTime.fromISO('1991-08-13'),
      summary: null,
    })

    const response = await client.get('/app/library?q=heat').withInertia().loginAs(user)
    response.assertOk()

    const page = response.inertiaProps
    assert.equal(page.query, 'heat')
    assert.deepEqual(
      page.movies.map((movie: { name: string }) => movie.name),
      ['Heat']
    )
    assert.deepEqual(page.series, [])
  })

  test('library entries order merges watched marks with their created at', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Ordering Viewer',
      email: 'ordering-library@example.com',
      password: 'secret123',
    })

    const movies = await Promise.all(
      (
        [
          ['Alpha', '2024-01-10T00:00:00.000Z', null],
          ['Bravo', '2024-01-20T00:00:00.000Z', '2024-03-01T10:00:00.000Z'],
          ['Charlie', '2024-02-01T00:00:00.000Z', '2024-06-01T10:00:00.000Z'],
          ['Delta', '2024-01-15T00:00:00.000Z', null],
          ['Echo', '2024-01-25T00:00:00.000Z', '2024-02-10T10:00:00.000Z'],
          ['Foxtrot', '2024-05-01T00:00:00.000Z', null],
        ] as Array<[name: string, createdAt: string, watchedAt: string | null]>
      ).map(async ([name, createdAt, watchedAt]) => {
        const movie = await Movie.create({
          userId: user.id,
          provider: 'tmdb',
          providerId: `movie-${name.toLowerCase()}`,
          name,
          createdAt: DateTime.fromISO(createdAt),
          bannerPath: `/movie-${name.toLowerCase()}.jpg`,
          posterPath: `/movie-${name.toLowerCase()}-poster.jpg`,
          releasedAt: DateTime.fromISO('1995-12-15'),
          summary: null,
        })

        if (watchedAt) {
          await WatchedMovie.create({
            userId: user.id,
            libraryEntryId: movie.id,
            providerId: movie.providerId,
            duration: 100,
            watchedAt: DateTime.fromISO(watchedAt),
          })
        }

        return movie
      })
    )
    assert.lengthOf(movies, 6)

    const response = await client.get('/app/library').withInertia().loginAs(user)
    response.assertOk()

    const page = response.inertiaProps
    assert.deepEqual(
      page.movies.map((movie: { name: string }) => movie.name),
      ['Charlie', 'Foxtrot', 'Bravo', 'Echo', 'Delta', 'Alpha']
    )
  })

  test('library summary limits movies and series to six entries with total counts', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Library Limiter',
      email: 'library-limiter@example.com',
      password: 'secret123',
    })

    for (let index = 1; index <= 8; index++) {
      await Movie.create({
        userId: user.id,
        provider: 'tmdb',
        providerId: `movie-${index}`,
        name: `Movie ${index}`,
        bannerPath: `/movie-${index}.jpg`,
        posterPath: `/movie-${index}-poster.jpg`,
        releasedAt: DateTime.fromISO('1995-12-15'),
        summary: null,
      })
      await Serie.create({
        userId: user.id,
        provider: `tmdb-${index}`,
        providerId: 'series-1',
        name: `Series ${index}`,
        bannerPath: `/series-${index}.jpg`,
        posterPath: `/series-${index}-poster.jpg`,
        releasedAt: DateTime.fromISO('2022-02-18'),
        summary: null,
      })
    }

    const response = await client.get('/app/library').withInertia().loginAs(user)
    response.assertOk()

    const page = response.inertiaProps
    assert.lengthOf(page.movies, 6)
    assert.lengthOf(page.series, 6)
    assert.equal(page.moviesCount, 8)
    assert.equal(page.seriesCount, 8)
  })

  test('authenticated users can search their dedicated movie library page', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Movie Searcher',
      email: 'movie-searcher@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Movie Searcher',
      email: 'other-movie-searcher@example.com',
      password: 'secret123',
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: null,
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-2',
      name: 'Thief',
      bannerPath: '/movie-2.jpg',
      posterPath: '/movie-2-poster.jpg',
      releasedAt: DateTime.fromISO('1981-03-27'),
      summary: null,
    })
    await Movie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'movie-3',
      name: 'Heat Wave',
      bannerPath: '/movie-3.jpg',
      posterPath: '/movie-3-poster.jpg',
      releasedAt: DateTime.fromISO('1991-08-13'),
      summary: null,
    })

    const response = await client.get('/app/library/movies?q=heat').withInertia().loginAs(user)
    response.assertOk()

    const page = response.inertiaProps
    assert.equal(page.query, 'heat')
    assert.deepEqual(
      page.movies.data.map((movie: { name: string }) => movie.name),
      ['Heat']
    )
  })

  test('authenticated users can filter their dedicated movie library page by watched status', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Movie Filterer',
      email: 'movie-filterer@example.com',
      password: 'secret123',
    })
    const watchedMovie = await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: null,
    })
    await Movie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'movie-2',
      name: 'Thief',
      bannerPath: '/movie-2.jpg',
      posterPath: '/movie-2-poster.jpg',
      releasedAt: DateTime.fromISO('1981-03-27'),
      summary: null,
    })
    await WatchedMovie.create({
      userId: user.id,
      libraryEntryId: watchedMovie.id,
      providerId: watchedMovie.providerId,
      duration: 170,
      watchedAt: DateTime.now(),
    })

    const watchedResponse = await client
      .get('/app/library/movies?status=watched')
      .withInertia()
      .loginAs(user)
    watchedResponse.assertOk()
    const watchedPage = watchedResponse.inertiaProps
    assert.equal(watchedPage.status, 'watched')
    assert.deepEqual(
      watchedPage.movies.data.map((movie: { name: string }) => movie.name),
      ['Heat']
    )

    const unwatchedResponse = await client
      .get('/app/library/movies?status=unwatched')
      .withInertia()
      .loginAs(user)
    unwatchedResponse.assertOk()
    const unwatchedPage = unwatchedResponse.inertiaProps
    assert.equal(unwatchedPage.status, 'unwatched')
    assert.deepEqual(
      unwatchedPage.movies.data.map((movie: { name: string }) => movie.name),
      ['Thief']
    )

    const allResponse = await client.get('/app/library/movies').withInertia().loginAs(user)
    allResponse.assertOk()
    const allPage = allResponse.inertiaProps
    assert.equal(allPage.status, 'all')
    assert.deepEqual(
      allPage.movies.data.map((movie: { name: string }) => movie.name),
      ['Thief', 'Heat']
    )
  })

  test('dedicated movie library pages use the Inertia infinite scroll contract', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Movie Scroller',
      email: 'movie-scroller@example.com',
      password: 'secret123',
    })
    const catalogSerie = await catalog.findSerieById('series-1')
    sinon.stub(catalog, 'findSerieById').resolves(catalogSerie)

    await user.related('movies').createMany(
      Array.from({ length: pagination.perPage * 2 }, (_, index) => ({
        provider: 'tmdb' as const,
        providerId: `scroll-movie-${index + 1}`,
        name: `Scroll Movie ${index + 1}`,
        bannerPath: `/scroll-movie-${index + 1}.jpg`,
        posterPath: `/scroll-movie-${index + 1}-poster.jpg`,
        releasedAt: DateTime.fromISO('2020-01-01'),
        summary: null,
      }))
    )
    await user.related('series').create({
      provider: 'tmdb',
      providerId: 'scroll-serie',
      name: 'Scroll Serie',
      bannerPath: '/scroll-serie.jpg',
      posterPath: '/scroll-serie-poster.jpg',
      releasedAt: DateTime.fromISO('2020-01-01'),
      summary: null,
    })

    const firstResponse = await client
      .get('/app/library/movies?q=Scroll')
      .withInertia()
      .loginAs(user)
    firstResponse.assertOk()
    const firstPage = firstResponse.body()

    assert.lengthOf(firstPage.props.movies.data, pagination.perPage)
    assert.equal(firstPage.props.movies.metadata.total, pagination.perPage * 2)
    assert.equal(firstPage.scrollProps.movies.currentPage, 1)
    assert.equal(firstPage.scrollProps.movies.nextPage, 2)
    assert.include(firstPage.mergeProps, 'movies.data')
    assert.include(firstPage.matchPropsOn, 'movies.data.id')

    const secondResponse = await client
      .get('/app/library/movies?q=Scroll&page=2')
      .withInertia()
      .loginAs(user)
    secondResponse.assertOk()
    const secondPage = secondResponse.body()

    assert.lengthOf(secondPage.props.movies.data, pagination.perPage)
    assert.equal(secondPage.scrollProps.movies.currentPage, 2)
    assert.isNull(secondPage.scrollProps.movies.nextPage)
    assert.notInclude(
      firstPage.props.movies.data.map((movie: { id: string }) => movie.id),
      secondPage.props.movies.data[0].id
    )

    const resetResponse = await client
      .get('/app/library/movies?q=Scroll Movie 1')
      .withInertiaPartialReload('library/movies', ['query', 'status', 'movies'])
      .header('X-Inertia-Reset', 'movies')
      .loginAs(user)
    resetResponse.assertOk()

    assert.isTrue(resetResponse.body().scrollProps.movies.reset)
    assert.notInclude(resetResponse.body().mergeProps, 'movies.data')

    await browserContext.loginAs(user)
    const moviesPage = await visit('/app/library')
    await moviesPage.getByRole('link', { name: 'Movies', exact: true }).click()
    await moviesPage
      .getByRole('button', {
        name: `Remove Scroll Movie ${pagination.perPage + 1} from library`,
        exact: true,
      })
      .scrollIntoViewIfNeeded()
    await moviesPage.assertExists(
      moviesPage.getByRole('button', { name: 'Remove Scroll Movie 1 from library', exact: true })
    )
    await moviesPage
      .getByRole('button', { name: 'Remove Scroll Movie 1 from library', exact: true })
      .scrollIntoViewIfNeeded()
    await moviesPage.waitForURL((url) => url.searchParams.get('page') === '2')

    await moviesPage.goBack()
    await moviesPage.assertPath('/app/library')
    const historyReload = moviesPage.waitForResponse(
      (response) => new URL(response.url()).pathname === '/app/library/movies'
    )
    await moviesPage.goForward()
    await historyReload
    await moviesPage.assertExists(
      moviesPage.getByRole('button', {
        name: `Remove Scroll Movie ${pagination.perPage * 2} from library`,
        exact: true,
      })
    )
    await moviesPage.assertExists(
      moviesPage.getByRole('button', { name: 'Remove Scroll Movie 1 from library', exact: true })
    )

    await moviesPage
      .getByRole('button', { name: 'Remove Scroll Movie 1 from library', exact: true })
      .click()
    await moviesPage.getByRole('button', { name: 'Remove from library' }).click()
    await moviesPage.assertTextContains('body', 'Title was removed from your library.')
    await moviesPage.assertNotExists(
      moviesPage.getByRole('button', { name: 'Remove Scroll Movie 1 from library', exact: true })
    )
    await moviesPage.assertNotExists(
      moviesPage.getByText('No movies match your search.', { exact: true })
    )
  })

  test('authenticated users can search their dedicated series library page', async ({
    assert,
    client,
  }) => {
    const user = await User.create({
      fullName: 'Series Searcher',
      email: 'series-searcher@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Series Searcher',
      email: 'other-series-searcher@example.com',
      password: 'secret123',
    })
    await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Severance',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('2022-02-18'),
      summary: null,
    })
    await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-2',
      name: 'The Bear',
      bannerPath: '/series-2.jpg',
      posterPath: '/series-2-poster.jpg',
      releasedAt: DateTime.fromISO('2022-06-23'),
      summary: null,
    })
    await Serie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'series-3',
      name: 'Severance Room',
      bannerPath: '/series-3.jpg',
      posterPath: '/series-3-poster.jpg',
      releasedAt: DateTime.fromISO('2020-01-01'),
      summary: null,
    })

    const response = await client.get('/app/library/series?q=severance').withInertia().loginAs(user)
    response.assertOk()

    const page = response.inertiaProps
    assert.equal(page.query, 'severance')
    assert.deepEqual(
      page.series.data.map((serie: { name: string }) => serie.name),
      ['Severance']
    )
  })

  test('authenticated users can filter series by exact tracking status', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Series Filterer',
      email: 'series-filterer@example.com',
      password: 'secret123',
    })
    const catalogSerie = await catalog.findSerieById('series-1')
    const definitions = [
      { name: 'Specials Only', total: 1, watched: 0, specials: 1, inProduction: true },
      { name: 'Ended Complete', total: 2, watched: 2, specials: 0, inProduction: false },
      { name: 'High Partial', total: 200, watched: 199, specials: 0, inProduction: false },
      { name: 'Low Positive', total: 201, watched: 1, specials: 0, inProduction: true },
      { name: 'Decimal Third', total: 3, watched: 1, specials: 0, inProduction: true },
      { name: 'Ongoing Caught Up', total: 1, watched: 1, specials: 0, inProduction: true },
    ]
    const series: Serie[] = []
    for (const [index, { name }] of definitions.entries()) {
      series.push(
        await Serie.create({
          userId: user.id,
          provider: 'tmdb',
          providerId: `status-series-${index + 1}`,
          name,
          bannerPath: `/status-series-${index + 1}.jpg`,
          posterPath: `/status-series-${index + 1}-poster.jpg`,
          releasedAt: DateTime.fromISO('2020-01-01'),
          summary: null,
        })
      )
    }

    const findSerieById = sinon.stub(catalog, 'findSerieById').callsFake(async (providerId) => {
      const index = Number(providerId.replace('status-series-', '')) - 1
      const definition = definitions[index]

      return {
        ...catalogSerie!,
        id: providerId,
        inProduction: definition.inProduction,
        episodesCount: definition.total,
        releasedEpisodesCount: definition.total,
        seasons: [],
      }
    })

    await Promise.all(
      series.map((serie, index) => {
        const definition = definitions[index]
        return WatchedEpisode.createMany([
          ...Array.from({ length: definition.watched }, (_, episode) => ({
            userId: user.id,
            libraryEntryId: serie.id,
            providerId: `${serie.providerId}-episode-${episode + 1}`,
            season: 1,
            episode: episode + 1,
            duration: 20,
            watchedAt: DateTime.now(),
          })),
          ...Array.from({ length: definition.specials }, (_, episode) => ({
            userId: user.id,
            libraryEntryId: serie.id,
            providerId: `${serie.providerId}-special-${episode + 1}`,
            season: 0,
            episode: episode + 1,
            duration: 20,
            watchedAt: DateTime.now(),
          })),
        ])
      })
    )

    const expectedNames = {
      'not-started': ['Specials Only'],
      'watching': ['Decimal Third', 'Low Positive', 'High Partial'],
      'finished': ['Ongoing Caught Up', 'Ended Complete'],
      'all': definitions.map(({ name }) => name).reverse(),
    }
    const expectedCatalogCalls = {
      'not-started': 1,
      'watching': 5,
      'finished': 5,
      'all': 6,
    }

    for (const [status, names] of Object.entries(expectedNames)) {
      const callsBefore = findSerieById.callCount
      const response = await client
        .get(`/app/library/series?status=${status}`)
        .withInertia()
        .loginAs(user)
      response.assertOk()
      assert.equal(response.inertiaProps.status, status)
      assert.deepEqual(
        response.inertiaProps.series.data.map((serie: { name: string }) => serie.name),
        names
      )
      assert.equal(
        findSerieById.callCount - callsBefore,
        expectedCatalogCalls[status as keyof typeof expectedCatalogCalls]
      )
    }

    const defaultCallsBefore = findSerieById.callCount
    const defaultResponse = await client.get('/app/library/series').withInertia().loginAs(user)
    defaultResponse.assertOk()
    assert.equal(defaultResponse.inertiaProps.status, 'all')
    assert.deepEqual(
      defaultResponse.inertiaProps.series.data.map((serie: { name: string }) => serie.name),
      expectedNames.all
    )
    assert.equal(findSerieById.callCount - defaultCallsBefore, definitions.length)

    const progressByName = Object.fromEntries(
      defaultResponse.inertiaProps.series.data.map((serie: { name: string; progress: number }) => [
        serie.name,
        serie.progress,
      ])
    )
    assert.equal(progressByName['High Partial'], 99.5)
    assert.equal(progressByName['Low Positive'], 100 / 201)
    assert.equal(progressByName['Decimal Third'], (1 / 3) * 100)
    assert.equal(progressByName['Specials Only'], 0)

    await browserContext.loginAs(user)
    const showCallsBefore = findSerieById.callCount
    const detailsPage = await visit(`/app/library/series/${series[4].id}`)
    await detailsPage.assertTextContains('body', '33.33%')
    assert.equal(findSerieById.callCount - showCallsBefore, 1)
  })

  test('dedicated series library pages use the Inertia infinite scroll contract', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Series Scroller',
      email: 'series-scroller@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Series Scroller',
      email: 'other-series-scroller@example.com',
      password: 'secret123',
    })
    const catalogSerie = await catalog.findSerieById('series-1')
    sinon.stub(catalog, 'findSerieById').resolves(catalogSerie)

    await user.related('series').createMany(
      Array.from({ length: pagination.perPage * 2 }, (_, index) => ({
        provider: 'tmdb' as const,
        providerId: `scroll-series-${index + 1}`,
        name: `Scroll Series ${index + 1}`,
        bannerPath: `/scroll-series-${index + 1}.jpg`,
        posterPath: `/scroll-series-${index + 1}-poster.jpg`,
        releasedAt: DateTime.fromISO('2020-01-01'),
        summary: null,
      }))
    )
    await user.related('movies').createMany(
      Array.from({ length: pagination.perPage * 2 }, (_, index) => ({
        provider: 'tmdb' as const,
        providerId: `scroll-movie-${index + 1}`,
        name: `Scroll Movie ${index + 1}`,
        bannerPath: `/scroll-movie-${index + 1}.jpg`,
        posterPath: `/scroll-movie-${index + 1}-poster.jpg`,
        releasedAt: DateTime.fromISO('2020-01-01'),
        summary: null,
      }))
    )
    await otherUser.related('series').create({
      provider: 'tmdb',
      providerId: 'other-scroll-series',
      name: 'Scroll Series Other User',
      bannerPath: '/other-scroll-series.jpg',
      posterPath: '/other-scroll-series-poster.jpg',
      releasedAt: DateTime.fromISO('2020-01-01'),
      summary: null,
    })

    const firstResponse = await client
      .get('/app/library/series?q=Scroll&status=not-started')
      .withInertia()
      .loginAs(user)
    firstResponse.assertOk()
    const firstPage = firstResponse.body()

    assert.lengthOf(firstPage.props.series.data, pagination.perPage)
    assert.equal(firstPage.props.series.metadata.total, pagination.perPage * 2)
    assert.equal(firstPage.props.status, 'not-started')
    assert.equal(firstPage.scrollProps.series.currentPage, 1)
    assert.equal(firstPage.scrollProps.series.nextPage, 2)
    assert.include(firstPage.mergeProps, 'series.data')
    assert.include(firstPage.matchPropsOn, 'series.data.id')

    const secondResponse = await client
      .get('/app/library/series?q=Scroll&status=not-started&page=2')
      .withInertia()
      .loginAs(user)
    secondResponse.assertOk()
    const secondPage = secondResponse.body()

    assert.lengthOf(secondPage.props.series.data, pagination.perPage)
    assert.equal(secondPage.scrollProps.series.currentPage, 2)
    assert.isNull(secondPage.scrollProps.series.nextPage)
    assert.notInclude(
      firstPage.props.series.data.map((serie: { id: string }) => serie.id),
      secondPage.props.series.data[0].id
    )

    const resetResponse = await client
      .get('/app/library/series?q=Scroll Series 1&status=not-started')
      .withInertiaPartialReload('library/series/index', ['query', 'status', 'series'])
      .header('X-Inertia-Reset', 'series')
      .loginAs(user)
    resetResponse.assertOk()

    assert.isTrue(resetResponse.body().scrollProps.series.reset)
    assert.equal(resetResponse.body().props.status, 'not-started')
    assert.notInclude(resetResponse.body().mergeProps, 'series.data')

    await browserContext.loginAs(user)
    const seriesPage = await visit('/app/library')
    await seriesPage.getByRole('link', { name: 'Series', exact: true }).click()
    await seriesPage
      .getByRole('link', { name: `Scroll Series ${pagination.perPage + 1}`, exact: true })
      .scrollIntoViewIfNeeded()
    await seriesPage.assertExists(
      seriesPage.getByRole('link', { name: 'Scroll Series 1', exact: true })
    )
    await seriesPage
      .getByRole('link', { name: 'Scroll Series 1', exact: true })
      .scrollIntoViewIfNeeded()
    await seriesPage.waitForURL((url) => url.searchParams.get('page') === '2')

    await seriesPage.goBack()
    await seriesPage.assertPath('/app/library')
    const historyReload = seriesPage.waitForResponse(
      (response) => new URL(response.url()).pathname === '/app/library/series'
    )
    await seriesPage.goForward()
    await historyReload
    await seriesPage.assertExists(
      seriesPage.getByRole('link', {
        name: `Scroll Series ${pagination.perPage * 2}`,
        exact: true,
      })
    )
    await seriesPage.assertExists(
      seriesPage.getByRole('link', { name: 'Scroll Series 1', exact: true })
    )

    await seriesPage
      .getByRole('button', { name: 'Remove Scroll Series 1 from library', exact: true })
      .click()
    await seriesPage.getByRole('button', { name: 'Remove from library' }).click()
    await seriesPage.assertTextContains('body', 'Title was removed from your library.')
    await seriesPage.assertNotExists(
      seriesPage.getByRole('link', { name: 'Scroll Series 1', exact: true })
    )
    await seriesPage.assertNotExists(
      seriesPage.getByText('No series match your search.', { exact: true })
    )
  })

  test('authenticated users cannot remove another user library entries by id', async ({
    assert,
    client,
  }) => {
    const owner = await User.create({
      fullName: 'Owner Removal',
      email: 'owner-library-removal@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Other Removal',
      email: 'other-library-removal@example.com',
      password: 'secret123',
    })
    const movie = await Movie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    const serie = await Serie.create({
      userId: owner.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })

    const movieResponse = await client
      .delete(`/api/library/${movie.id}`)
      .loginAs(otherUser)
      .withCsrfToken()
    const serieResponse = await client
      .delete(`/api/library/${serie.id}`)
      .loginAs(otherUser)
      .withCsrfToken()

    movieResponse.assertNotFound()
    serieResponse.assertNotFound()
    assert.lengthOf(await Movie.query().where('userId', owner.id).where('id', movie.id), 1)
    assert.lengthOf(await Serie.query().where('userId', owner.id).where('id', serie.id), 1)
  })

  test('removing a watched movie library entry removes its watched mark and watched time', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Morgan Watched Removal',
      email: 'morgan-watched-removal@example.com',
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
      summary: 'A professional thief and a relentless detective collide.',
    })

    await client.post(`/api/library/movies/${movie.id}/watch`).loginAs(user).withCsrfToken()
    await user.refresh()
    assert.equal(user.watchedTime, 170)

    await browserContext.loginAs(user)
    const libraryPage = await visit('/app/library')
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No movies in your library yet.')

    assert.lengthOf(
      await WatchedMovie.query().where('userId', user.id).where('libraryEntryId', movie.id),
      0
    )
    await user.refresh()
    assert.equal(user.watchedTime, 0)
  })

  test('authenticated users can remove a series library entry from their library', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Riley Viewer',
      email: 'riley-remove-series@example.com',
      password: 'secret123',
    })
    await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })

    await browserContext.loginAs(user)

    const libraryPage = await visit('/app/library')
    await libraryPage.assertExists(
      libraryPage.getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
    )
    await libraryPage
      .getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
      .click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No series in your library yet.')

    assert.lengthOf(await Serie.query().where('userId', user.id), 0)
  })

  test('removing a tracked series library entry removes episode marks and watched time', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const user = await User.create({
      fullName: 'Riley Watched Removal',
      email: 'riley-watched-removal@example.com',
      password: 'secret123',
    })
    const serie = await Serie.create({
      userId: user.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })

    await client
      .post(`/api/library/series/${serie.id}/seasons/1/episodes/1/watch`)
      .loginAs(user)
      .withCsrfToken()
    await user.refresh()
    assert.equal(user.watchedTime, 24)

    await browserContext.loginAs(user)
    const libraryPage = await visit('/app/library')
    await libraryPage
      .getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
      .click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No series in your library yet.')

    assert.lengthOf(
      await WatchedEpisode.query().where('userId', user.id).where('libraryEntryId', serie.id),
      0
    )
    await user.refresh()
    assert.equal(user.watchedTime, 0)
  })

  test('removing a movie library entry does not affect another user', async ({
    assert,
    browserContext,
    visit,
  }) => {
    const removingUser = await User.create({
      fullName: 'Casey Viewer',
      email: 'casey-remove-library@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Taylor Viewer',
      email: 'taylor-keep-library@example.com',
      password: 'secret123',
    })
    await Movie.create({
      userId: removingUser.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    await Movie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })

    await browserContext.loginAs(removingUser)

    const libraryPage = await visit('/app/library')
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No movies in your library yet.')

    assert.lengthOf(await Movie.query().where('userId', removingUser.id), 0)
    assert.lengthOf(await Movie.query().where('userId', otherUser.id), 1)
  })

  test('removing a watched movie library entry does not affect another user watched mark', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const removingUser = await User.create({
      fullName: 'Casey Watched Removal',
      email: 'casey-watched-removal@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Taylor Watched Keep',
      email: 'taylor-watched-keep@example.com',
      password: 'secret123',
    })
    const removingMovie = await Movie.create({
      userId: removingUser.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })
    const otherMovie = await Movie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'movie-1',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: DateTime.fromISO('1995-12-15'),
      summary: 'A professional thief and a relentless detective collide.',
    })

    await client
      .post(`/api/library/movies/${removingMovie.id}/watch`)
      .loginAs(removingUser)
      .withCsrfToken()
    await client
      .post(`/api/library/movies/${otherMovie.id}/watch`)
      .loginAs(otherUser)
      .withCsrfToken()

    await browserContext.loginAs(removingUser)
    const libraryPage = await visit('/app/library')
    await libraryPage.getByRole('button', { name: 'Remove Heat from library' }).click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No movies in your library yet.')

    assert.lengthOf(
      await WatchedMovie.query()
        .where('userId', removingUser.id)
        .where('libraryEntryId', removingMovie.id),
      0
    )
    assert.lengthOf(
      await WatchedMovie.query()
        .where('userId', otherUser.id)
        .where('libraryEntryId', otherMovie.id),
      1
    )
    await removingUser.refresh()
    await otherUser.refresh()
    assert.equal(removingUser.watchedTime, 0)
    assert.equal(otherUser.watchedTime, 170)
  })

  test('removing a series library entry does not affect another user', async ({
    assert,
    browserContext,
    client,
    visit,
  }) => {
    const removingUser = await User.create({
      fullName: 'Avery Viewer',
      email: 'avery-remove-series@example.com',
      password: 'secret123',
    })
    const otherUser = await User.create({
      fullName: 'Jordan Viewer',
      email: 'jordan-keep-series@example.com',
      password: 'secret123',
    })
    const removingSerie = await Serie.create({
      userId: removingUser.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })
    const otherSerie = await Serie.create({
      userId: otherUser.id,
      provider: 'tmdb',
      providerId: 'series-1',
      name: 'Heat Vision and Jack',
      bannerPath: '/series-1.jpg',
      posterPath: '/series-1-poster.jpg',
      releasedAt: DateTime.fromISO('1999-01-01'),
      summary: 'A pilot about a super-intelligent astronaut.',
    })
    await client
      .post(`/api/library/series/${removingSerie.id}/seasons/1/episodes/1/watch`)
      .loginAs(removingUser)
      .withCsrfToken()
    await client
      .post(`/api/library/series/${otherSerie.id}/seasons/1/episodes/1/watch`)
      .loginAs(otherUser)
      .withCsrfToken()

    await browserContext.loginAs(removingUser)

    const libraryPage = await visit('/app/library')
    await libraryPage
      .getByRole('button', { name: 'Remove Heat Vision and Jack from library' })
      .click()
    await libraryPage.getByRole('button', { name: 'Remove from library' }).click()
    await libraryPage.assertTextContains('body', 'Title was removed from your library.')
    await libraryPage.assertTextContains('body', 'No series in your library yet.')

    assert.lengthOf(await Serie.query().where('userId', removingUser.id), 0)
    assert.lengthOf(await Serie.query().where('userId', otherUser.id), 1)
    assert.lengthOf(
      await WatchedEpisode.query()
        .where('userId', removingUser.id)
        .where('libraryEntryId', removingSerie.id),
      0
    )
    assert.lengthOf(
      await WatchedEpisode.query()
        .where('userId', otherUser.id)
        .where('libraryEntryId', otherSerie.id),
      1
    )
    await removingUser.refresh()
    await otherUser.refresh()
    assert.equal(removingUser.watchedTime, 0)
    assert.equal(otherUser.watchedTime, 24)
  })
})
