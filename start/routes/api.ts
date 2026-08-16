import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'

const group = router.group(() => {
  router.get('hello', () => ({ message: 'Hello from Watch Wise' })).as('hello')

  router
    .group(() => {
      router.post('library', [controllers.api.Library, 'store']).as('library.store')
      router.patch('user', [controllers.api.User, 'update']).as('user.update')
      router.delete('cache/tmdb', [controllers.api.Cache, 'clearTmdb']).as('cache.tmdb.clear')
      router.get('user/settings', [controllers.api.UserSettings, 'show']).as('user.settings.show')
      router
        .patch('user/settings', [controllers.api.UserSettings, 'update'])
        .as('user.settings.update')
      router.delete('library/:id', [controllers.api.Library, 'destroy']).as('library.destroy')
      router
        .post('library/movies/:id/watch', [controllers.api.Movies, 'watch'])
        .as('library.movies.watch')
      router
        .delete('library/movies/:id/watch', [controllers.api.Movies, 'unwatch'])
        .as('library.movies.unwatch')
      router
        .get('library/series/:id/seasons/:season/episodes', [
          controllers.api.series.Episodes,
          'index',
        ])
        .as('library.series.seasons.episodes')
      router
        .post('library/series/:id/seasons/:season/watch', [controllers.api.series.Seasons, 'watch'])
        .as('library.series.seasons.watch')
      router
        .post('library/series/:id/watch', [controllers.api.series.Seasons, 'watchAll'])
        .as('library.series.watch')
      router
        .post('library/series/:id/seasons/:season/episodes/:episode/watch-before', [
          controllers.api.series.Episodes,
          'watchBefore',
        ])
        .as('library.series.episodes.watch_before')
      router
        .post('library/series/:id/seasons/:season/episodes/:episode/watch', [
          controllers.api.series.Episodes,
          'watch',
        ])
        .as('library.series.episodes.watch')
      router
        .delete('library/series/:id/seasons/:season/episodes/:episode/watch', [
          controllers.api.series.Episodes,
          'unwatch',
        ])
        .as('library.series.episodes.unwatch')
    })
    .use(middleware.auth())
})

group.as('api').prefix('/api')
