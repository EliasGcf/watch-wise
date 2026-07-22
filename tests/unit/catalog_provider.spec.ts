import { createClient } from '#generated/tmdb/client/index'
import { TmdbSdk } from '#generated/tmdb/sdk.gen'
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
              release_date: '1995-12-15',
              overview: 'A professional thief and a relentless detective collide.',
            },
            {
              id: 2,
              media_type: 'tv',
              name: 'Heat Vision and Jack',
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
        providerTitleId: '1',
        type: 'movie',
        name: 'Heat',
        releaseYear: 1995,
        summary: 'A professional thief and a relentless detective collide.',
      },
      {
        provider: 'tmdb',
        providerTitleId: '2',
        type: 'series',
        name: 'Heat Vision and Jack',
        releaseYear: 1999,
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
})

function makeTmdbSdk(response: Response) {
  return new TmdbSdk({
    client: createClient({
      baseUrl: 'https://api.themoviedb.org',
      fetch: async () => response,
    }),
  })
}
