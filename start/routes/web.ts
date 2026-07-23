import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const group = router.group(() => {
  router.on('/').renderInertia('home', {}).as('home')

  router
    .group(() => {
      router.get('signup', [controllers.web.NewAccount, 'create'])
      router.post('signup', [controllers.web.NewAccount, 'store'])

      router.get('login', [controllers.web.Session, 'create'])
      router.post('login', [controllers.web.Session, 'store'])
    })
    .use(middleware.guest())

  router
    .group(() => {
      router.post('logout', [controllers.web.Session, 'destroy'])
      router.get('catalog/search', [controllers.web.CatalogSearch, 'index'])
      router.get('library', [controllers.web.Library, 'index']).as('library.index')
      router.get('library/movies', [controllers.web.Library, 'movies']).as('library.movies.index')
      router.get('library/series', [controllers.web.Library, 'series']).as('library.series.index')
      router.post('library', [controllers.web.Library, 'store']).as('library.store')
      router
        .post('library/:id/watched', [controllers.web.Library, 'markWatched'])
        .as('library.watched.store')
      router
        .delete('library/:id/watched', [controllers.web.Library, 'unmarkWatched'])
        .as('library.watched.destroy')
    })
    .use(middleware.auth())
})

group.as('app').prefix('/app')
