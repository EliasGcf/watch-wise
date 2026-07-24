import { createClient } from '#generated/tmdb/client/index'
import { TmdbSdk } from '#generated/tmdb/sdk.gen'
import FakeCatalogProviderDriver from '#providers/catalog_provider/drivers/fake_driver'
import TmdbCatalogProviderDriver from '#providers/catalog_provider/drivers/tmdb_driver'
import { CatalogProviderError } from '#services/catalog_provider'
import { test } from '@japa/runner'

test.group('Catalog provider', () => {
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
              release_date: '1995-12-15',
              overview: 'A professional thief and a relentless detective collide.',
            },
            {
              id: 2,
              media_type: 'tv',
              name: 'Heat Vision and Jack',
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

    const results = await new TmdbCatalogProviderDriver({ accessToken: 'test-token' }, tmdb).search(
      'heat'
    )

    assert.deepEqual(results, [
      {
        provider: 'tmdb',
        id: '1',
        type: 'movie',
        name: 'Heat',
        bannerUrl: 'https://image.tmdb.org/t/p/w780/heat.jpg',
        releasedAt: '1995-12-15',
        summary: 'A professional thief and a relentless detective collide.',
      },
      {
        provider: 'tmdb',
        id: '2',
        type: 'serie',
        name: 'Heat Vision and Jack',
        bannerUrl: 'https://image.tmdb.org/t/p/w780/heat-vision.jpg',
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
      () => new TmdbCatalogProviderDriver({ accessToken: 'test-token' }, tmdb).search('heat'),
      CatalogProviderError
    )
  })

  test('finds fake catalog titles by provider id and type', async ({ assert }) => {
    const driver = new FakeCatalogProviderDriver({
      failureQuery: 'fail',
    })

    assert.deepEqual(await driver.find('movie', 'movie-1'), {
      provider: 'tmdb',
      id: 'movie-1',
      type: 'movie',
      name: 'Heat',
      bannerUrl: 'https://image.tmdb.org/t/p/w780/movie-1.jpg',
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
          release_date: '1995-12-15',
          runtime: 170,
          overview: 'A professional thief and a relentless detective collide.',
        }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      )
    )

    assert.deepEqual(
      await new TmdbCatalogProviderDriver({ accessToken: 'test-token' }, tmdb).findMovieById('1'),
      {
        provider: 'tmdb',
        id: '1',
        type: 'movie',
        name: 'Heat',
        bannerUrl: 'https://image.tmdb.org/t/p/w780/heat.jpg',
        releasedAt: '1995-12-15',
        duration: 170,
        summary: 'A professional thief and a relentless detective collide.',
      }
    )
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
