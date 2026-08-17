import { createClient } from '#generated/tmdb/client/index'
import { TmdbSdk } from '#generated/tmdb/sdk.gen'
import FakeCatalogProviderDriver from '#providers/catalog/drivers/fake_driver'
import TmdbCatalogProviderDriver from '#providers/catalog/drivers/tmdb_driver'
import { CatalogProviderError } from '#services/catalog_provider'
import cache from '@adonisjs/cache/services/main'
import config from '@adonisjs/core/services/config'
import { test } from '@japa/runner'

test.group('Catalog provider', (group) => {
  group.each.setup(() => {
    return () => cache.clear()
  })

  test('maps TMDB multi search to movie and series titles only', async ({ assert }) => {
    const tmdb = makeTmdbSdk(
      new Response(
        JSON.stringify({
          results: [
            {
              id: 1,
              media_type: 'movie',
              title: 'Heat',
              backdrop_path: '/heat.jpg',
              poster_path: '/heat-poster.jpg',
              release_date: '1995-12-15',
              overview: 'A professional thief and a relentless detective collide.',
            },
            {
              id: 2,
              media_type: 'tv',
              name: 'Heat Vision and Jack',
              backdrop_path: '/heat-vision-backdrop.jpg',
              poster_path: '/heat-vision.jpg',
              release_date: '1999-01-01',
              overview: 'A pilot about a super-intelligent astronaut.',
            },
            {
              id: 3,
              media_type: 'person',
              name: 'Michael Mann',
            },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    )

    const results = await new TmdbCatalogProviderDriver(
      { baseImageUrl: 'https://image.tmdb.org/t/p/', accessToken: 'test-token' },
      tmdb
    ).search('heat')

    assert.deepEqual(results, [
      {
        provider: 'tmdb',
        id: '1',
        type: 'movie',
        name: 'Heat',
        bannerPath: '/heat.jpg',
        posterPath: '/heat-poster.jpg',
        releasedAt: '1995-12-15',
        summary: 'A professional thief and a relentless detective collide.',
      },
      {
        provider: 'tmdb',
        id: '2',
        type: 'serie',
        name: 'Heat Vision and Jack',
        bannerPath: '/heat-vision-backdrop.jpg',
        posterPath: '/heat-vision.jpg',
        releasedAt: '1999-01-01',
        summary: 'A pilot about a super-intelligent astronaut.',
      },
    ])
  })

  test('represents invalid TMDB responses as provider failures', async ({ assert }) => {
    const tmdb = makeTmdbSdk(
      new Response('not-json', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )

    await assert.rejects(
      () =>
        new TmdbCatalogProviderDriver(
          { baseImageUrl: 'https://image.tmdb.org/t/p/', accessToken: 'test-token' },
          tmdb
        ).search('heat'),
      CatalogProviderError
    )
  })

  test('finds fake catalog titles by provider id and type', async ({ assert }) => {
    const driver = new FakeCatalogProviderDriver({
      baseImageUrl: 'https://image.tmdb.org/t/p/original/',
      failureQuery: 'fail',
    })

    assert.deepEqual(await driver.find('movie', 'movie-1'), {
      provider: 'tmdb',
      id: 'movie-1',
      type: 'movie',
      name: 'Heat',
      bannerPath: '/movie-1.jpg',
      posterPath: '/movie-1-poster.jpg',
      releasedAt: '1995-12-15',
      duration: 170,
      summary: 'A professional thief and a relentless detective collide.',
    })
    assert.isNull(await driver.find('serie', 'movie-1'))
  })

  test('maps TMDB detail responses to catalog titles', async ({ assert }) => {
    const tmdb = makeTmdbSdk(
      new Response(
        JSON.stringify({
          id: 1,
          title: 'Heat',
          backdrop_path: '/heat.jpg',
          poster_path: '/heat-poster.jpg',
          release_date: '1995-12-15',
          runtime: 170,
          overview: 'A professional thief and a relentless detective collide.',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    )

    assert.deepEqual(
      await new TmdbCatalogProviderDriver(
        { baseImageUrl: 'https://image.tmdb.org/t/p/', accessToken: 'test-token' },
        tmdb
      ).findMovieById('1'),
      {
        provider: 'tmdb',
        id: '1',
        type: 'movie',
        name: 'Heat',
        bannerPath: '/heat.jpg',
        posterPath: '/heat-poster.jpg',
        releasedAt: '1995-12-15',
        duration: 170,
        summary: 'A professional thief and a relentless detective collide.',
      }
    )
  })

  test('maps TMDB series detail response with in_production field', async ({ assert }) => {
    const tmdb = makeTmdbSdk(
      new Response(
        JSON.stringify({
          id: 1,
          name: 'Heat Vision and Jack',
          backdrop_path: '/heat-vision-backdrop.jpg',
          poster_path: '/heat-vision.jpg',
          first_air_date: '1999-01-01',
          overview: 'A pilot about a super-intelligent astronaut.',
          in_production: false,
          seasons: [{ name: 'Season 1', season_number: 1, episode_count: 2 }],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    )

    assert.deepEqual(
      await new TmdbCatalogProviderDriver(
        { baseImageUrl: 'https://image.tmdb.org/t/p/', accessToken: 'test-token' },
        tmdb
      ).findSerieById('1'),
      {
        provider: 'tmdb',
        id: '1',
        type: 'serie',
        name: 'Heat Vision and Jack',
        bannerPath: '/heat-vision-backdrop.jpg',
        posterPath: '/heat-vision.jpg',
        releasedAt: '1999-01-01',
        summary: 'A pilot about a super-intelligent astronaut.',
        inProduction: false,
        episodesCount: 2,
        releasedEpisodesCount: 2,
        seasons: [{ name: 'Season 1', number: 1, episodesCount: 2, releasedEpisodesCount: 2 }],
      }
    )
  })

  test('maps TMDB series detail response to released counts from last episode to air', async ({
    assert,
  }) => {
    const tmdb = makeTmdbSdk(
      new Response(
        JSON.stringify({
          id: 1,
          name: 'Heat Vision and Jack',
          backdrop_path: '/heat-vision-backdrop.jpg',
          poster_path: '/heat-vision.jpg',
          first_air_date: '1999-01-01',
          overview: 'A pilot about a super-intelligent astronaut.',
          last_episode_to_air: { episode_number: 1, season_number: 2 },
          seasons: [
            { name: 'Specials', season_number: 0, episode_count: 1 },
            { name: 'Season 1', season_number: 1, episode_count: 3 },
            { name: 'Season 2', season_number: 2, episode_count: 3 },
            { name: 'Season 3', season_number: 3, episode_count: 2 },
          ],
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    )

    assert.deepEqual(
      await new TmdbCatalogProviderDriver(
        { baseImageUrl: 'https://image.tmdb.org/t/p/', accessToken: 'test-token' },
        tmdb
      ).findSerieById('1'),
      {
        provider: 'tmdb',
        id: '1',
        type: 'serie',
        name: 'Heat Vision and Jack',
        bannerPath: '/heat-vision-backdrop.jpg',
        posterPath: '/heat-vision.jpg',
        releasedAt: '1999-01-01',
        summary: 'A pilot about a super-intelligent astronaut.',
        inProduction: true,
        episodesCount: 8,
        releasedEpisodesCount: 4,
        seasons: [
          { name: 'Specials', number: 0, episodesCount: 1, releasedEpisodesCount: 1 },
          { name: 'Season 1', number: 1, episodesCount: 3, releasedEpisodesCount: 3 },
          { name: 'Season 2', number: 2, episodesCount: 3, releasedEpisodesCount: 1 },
          { name: 'Season 3', number: 3, episodesCount: 2, releasedEpisodesCount: 0 },
        ],
      }
    )
  })

  test('caches TMDB search results by query', async ({ assert }) => {
    let calls = 0
    const tmdb = new TmdbSdk({
      client: createClient({
        baseUrl: 'https://api.themoviedb.org',
        fetch: async () => {
          calls += 1

          return new Response(
            JSON.stringify({
              results: [
                {
                  id: calls,
                  media_type: 'movie',
                  title: 'Heat',
                  release_date: '1995-12-15',
                },
              ],
            }),
            { status: 200, headers: { 'content-type': 'application/json' } }
          )
        },
      }),
    })
    const driver = new TmdbCatalogProviderDriver(
      { baseImageUrl: 'https://image.tmdb.org/t/p/', accessToken: 'test-token' },
      tmdb
    )

    assert.deepEqual(await driver.search('heat'), await driver.search('heat'))
    assert.equal(calls, 1)
  })

  test('bypasses TMDB cache when disabled', async ({ assert }) => {
    config.set('cache.enabled', false)
    let calls = 0
    const tmdb = new TmdbSdk({
      client: createClient({
        baseUrl: 'https://api.themoviedb.org',
        fetch: async () => {
          calls += 1

          return new Response(
            JSON.stringify({
              results: [
                {
                  id: calls,
                  media_type: 'movie',
                  title: 'Heat',
                  release_date: '1995-12-15',
                },
              ],
            }),
            { status: 200, headers: { 'content-type': 'application/json' } }
          )
        },
      }),
    })
    const driver = new TmdbCatalogProviderDriver(
      { baseImageUrl: 'https://image.tmdb.org/t/p/', accessToken: 'test-token' },
      tmdb
    )

    await driver.search('heat')
    await driver.search('heat')

    assert.equal(calls, 2)
    config.set('cache.enabled', true)
  })

  test('builds TMDB image URLs at each size per image kind', async ({ assert }) => {
    const driver = new TmdbCatalogProviderDriver({
      baseImageUrl: 'https://image.tmdb.org/t/p/',
      accessToken: 'test-token',
    })

    assert.equal(
      driver.imageUrl('poster', '/xyz.jpg', 'sm'),
      'https://image.tmdb.org/t/p/w342/xyz.jpg'
    )
    assert.equal(
      driver.imageUrl('poster', '/xyz.jpg', 'md'),
      'https://image.tmdb.org/t/p/w500/xyz.jpg'
    )
    assert.equal(
      driver.imageUrl('poster', '/xyz.jpg', 'lg'),
      'https://image.tmdb.org/t/p/w780/xyz.jpg'
    )
    assert.equal(
      driver.imageUrl('poster', '/xyz.jpg', 'original'),
      'https://image.tmdb.org/t/p/original/xyz.jpg'
    )
    assert.equal(
      driver.imageUrl('banner', '/xyz.jpg', 'sm'),
      'https://image.tmdb.org/t/p/w300/xyz.jpg'
    )
    assert.equal(
      driver.imageUrl('banner', '/xyz.jpg', 'lg'),
      'https://image.tmdb.org/t/p/w1280/xyz.jpg'
    )
    assert.isNull(driver.imageUrl('poster', null, 'sm'))
  })

  test('fake driver builds image URLs from its base URL at every size', async ({ assert }) => {
    const driver = new FakeCatalogProviderDriver({
      baseImageUrl: 'https://image.tmdb.org/t/p/original/',
      failureQuery: 'fail',
    })

    assert.equal(
      driver.imageUrl('poster', '/xyz.jpg', 'sm'),
      'https://image.tmdb.org/t/p/original/xyz.jpg'
    )
    assert.equal(
      driver.imageUrl('banner', '/xyz.jpg', 'original'),
      'https://image.tmdb.org/t/p/original/xyz.jpg'
    )
    assert.isNull(driver.imageUrl('poster', null, 'lg'))
  })
})

function makeTmdbSdk(response: Response) {
  return new TmdbSdk({
    client: createClient({
      baseUrl: 'https://api.themoviedb.org',
      fetch: async () => response,
    }),
  })
}
