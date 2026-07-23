import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const ApiLibraryController = () => import('#controllers/api/library_controller')

const group = router.group(() => {
  router.get('hello', () => ({ message: 'Hello from Watch Wise' })).as('hello')

  router
    .group(() => {
      router.get('library/movies', [ApiLibraryController, 'movies']).as('library.movies.index')
      router.get('library/series', [ApiLibraryController, 'series']).as('library.series.index')
    })
    .use(middleware.auth())
})

group.as('api').prefix('/api')
