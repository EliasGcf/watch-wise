import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'

const group = router.group(() => {
  router.get('hello', () => ({ message: 'Hello from Watch Wise' })).as('hello')

  router
    .group(() => {
      router
        .post('library/movies/:id/watch', [controllers.api.Movies, 'watch'])
        .as('library.movies.watch')
      router
        .delete('library/movies/:id/watch', [controllers.api.Movies, 'unwatch'])
        .as('library.movies.unwatch')
      router
        .get('library/series/:id/seasons/:season/episodes', [controllers.api.Series, 'episodes'])
        .as('library.series.seasons.episodes')
      router
        .post('library/series/:id/seasons/:season/watch', [controllers.api.Series, 'watchSeason'])
        .as('library.series.seasons.watch')
      router
        .post('library/series/:id/watch', [controllers.api.Series, 'watchSeries'])
        .as('library.series.watch')
      router
        .post('library/series/:id/seasons/:season/episodes/:episode/watch', [
          controllers.api.Series,
          'watchEpisode',
        ])
        .as('library.series.episodes.watch')
      router
        .delete('library/series/:id/seasons/:season/episodes/:episode/watch', [
          controllers.api.Series,
          'unwatchEpisode',
        ])
        .as('library.series.episodes.unwatch')
    })
    .use(middleware.auth())
})

group.as('api').prefix('/api')
