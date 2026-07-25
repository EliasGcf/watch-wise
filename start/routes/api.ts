import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

import { controllers } from '#generated/controllers'

const group = router.group(() => {
  router.get('hello', () => ({ message: 'Hello from Watch Wise' })).as('hello')

  router
    .group(() => {
      router.get('library/movies', [controllers.api.Library, 'movies'])
      router.get('library/series', [controllers.api.Library, 'series'])
      router
        .get('library/series/:id/seasons', [controllers.api.Library, 'seriesSeasons'])
        .as('library.series.seasons')
      router
        .get('library/series/:id/seasons/:season/episodes', [
          controllers.api.Library,
          'seasonEpisodes',
        ])
        .as('library.series.season_episodes')
    })
    .use(middleware.auth())
})

group.as('api').prefix('/api')
