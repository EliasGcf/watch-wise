import { createClient } from '#generated/sonarr/client/index'
import { SonarrSdk } from '#generated/sonarr/sdk.gen'
import SonarrProviderDriver from '#providers/sonarr/drivers/sonarr_driver'
import { SonarrProviderError } from '#providers/sonarr/types'
import { test } from '@japa/runner'

test.group('Sonarr provider', () => {
  test('deletes the matching episode media file by catalog provider id and episode coordinates', async ({
    assert,
  }) => {
    const sonarr = makeSonarrSdk({
      series: [{ id: 10, tmdbId: 123 }],
      episodes: [{ seasonNumber: 2, episodeNumber: 3, hasFile: true, episodeFileId: 42 }],
    })

    await makeDriver(sonarr).deleteEpisodeFileByCatalogProviderId('123', 2, 3)

    assert.deepEqual(sonarr.deletedEpisodeFileIds, [42])
    assert.equal(sonarr.episodeQuery?.get('seriesId'), '10')
    assert.equal(sonarr.episodeQuery?.get('seasonNumber'), '2')
    assert.equal(sonarr.episodeQuery?.get('includeEpisodeFile'), 'true')
  })

  test('does nothing when Sonarr cannot resolve a deletable episode file', async ({ assert }) => {
    const cases = [
      {
        series: [],
        episodes: [{ seasonNumber: 2, episodeNumber: 3, hasFile: true, episodeFileId: 42 }],
      },
      { series: [{ id: 10, tmdbId: 123 }], episodes: [] },
      { series: [{ id: 10, tmdbId: 123 }], episodes: [{ seasonNumber: 2, episodeNumber: 3 }] },
      {
        series: [{ id: 10, tmdbId: 123 }],
        episodes: [{ seasonNumber: 2, episodeNumber: 3, hasFile: false, episodeFileId: 42 }],
      },
      {
        series: [{ id: 10, tmdbId: 123 }],
        episodes: [{ seasonNumber: 2, episodeNumber: 3, hasFile: true }],
      },
    ]

    for (const data of cases) {
      const sonarr = makeSonarrSdk(data)

      await makeDriver(sonarr).deleteEpisodeFileByCatalogProviderId('123', 2, 3)

      assert.deepEqual(sonarr.deletedEpisodeFileIds, [])
    }
  })

  test('surfaces Sonarr failures', async ({ assert }) => {
    for (const failAt of ['series', 'episodes', 'delete'] as const) {
      const sonarr = makeSonarrSdk({
        failAt,
        series: [{ id: 10, tmdbId: 123 }],
        episodes: [{ seasonNumber: 2, episodeNumber: 3, hasFile: true, episodeFileId: 42 }],
      })

      await assert.rejects(
        () => makeDriver(sonarr).deleteEpisodeFileByCatalogProviderId('123', 2, 3),
        SonarrProviderError
      )
    }
  })
})

function makeDriver(
  sonarr: SonarrSdk & { deletedEpisodeFileIds: number[]; episodeQuery?: URLSearchParams }
) {
  return new SonarrProviderDriver({ baseUrl: 'http://sonarr.test', apiKey: 'test-key' }, sonarr)
}

function makeSonarrSdk(data: {
  series?: Array<{ id?: number; tmdbId?: number }>
  episodes?: Array<{
    seasonNumber?: number
    episodeNumber?: number
    hasFile?: boolean
    episodeFileId?: number
  }>
  failAt?: 'series' | 'episodes' | 'delete'
}): SonarrSdk & { deletedEpisodeFileIds: number[]; episodeQuery?: URLSearchParams } {
  const deletedEpisodeFileIds: number[] = []
  const sonarr = new SonarrSdk({
    client: createClient({
      baseUrl: 'http://sonarr.test',
      fetch: async (input, init) => {
        const request = new Request(input, init)
        const url = new URL(request.url)
        if (request.method === 'GET' && url.pathname === '/api/v3/series') {
          if (data.failAt === 'series') throw new Error('Sonarr series request failed')

          return json(data.series ?? [])
        }
        if (request.method === 'GET' && url.pathname === '/api/v3/episode') {
          if (data.failAt === 'episodes') throw new Error('Sonarr episode request failed')

          sonarr.episodeQuery = url.searchParams
          return json(data.episodes ?? [])
        }
        if (request.method === 'DELETE' && url.pathname.startsWith('/api/v3/episodefile/')) {
          if (data.failAt === 'delete') throw new Error('Sonarr deletion failed')

          deletedEpisodeFileIds.push(Number(url.pathname.split('/').at(-1)))
          return json(null)
        }

        return new Response('Not found', { status: 404 })
      },
    }),
  }) as SonarrSdk & { deletedEpisodeFileIds: number[]; episodeQuery?: URLSearchParams }
  sonarr.deletedEpisodeFileIds = deletedEpisodeFileIds

  return sonarr
}

function json(body: unknown) {
  return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } })
}
