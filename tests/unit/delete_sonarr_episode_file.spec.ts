import type { events } from '#generated/events'
import DeleteSonarrEpisodeFile from '#listeners/delete_sonarr_episode_file'
import { test } from '@japa/runner'

type EpisodeWatchedEvent = InstanceType<typeof events.EpisodeWatched>

test.group('Delete Sonarr episode file listener', () => {
  test('defers provider action until transaction commit', async ({ assert }) => {
    const listener = new DeleteSonarrEpisodeFile()
    let committed = false
    let ran = false

    listener.deleteEpisodeFile = async () => {
      ran = true
    }

    const event = {
      userId: 1,
      watched: { libraryEntryId: 2, season: 3, episode: 4 },
      $trx: {
        after(transactionEvent: string, callback: () => void) {
          assert.equal(transactionEvent, 'commit')
          assert.isFalse(ran)
          committed = true
          callback()
          return this
        },
      },
    } as unknown as EpisodeWatchedEvent

    listener.handle(event)

    await new Promise((resolve) => setImmediate(resolve))
    assert.isTrue(committed)
    assert.isTrue(ran)
  })
})
