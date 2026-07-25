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
      router.get('catalog/search', [controllers.web.CatalogSearch, 'index']).as('catalog.search')
      router.get('library', [controllers.web.Library, 'index'])
      router.post('library', [controllers.web.Library, 'store'])
      router.get('library/series/:id', [controllers.web.Series, 'show']).as('library.series.show')
      router
        .post('library/movies/:id/watch', [controllers.web.Movies, 'watch'])
        .as('library.movies.watch')
      router
        .delete('library/movies/:id/watch', [controllers.web.Movies, 'unwatch'])
        .as('library.movies.unwatch')
      router
        .post('library/series/:id/seasons/:season/episodes/:episode/watch', [
          controllers.web.Episodes,
          'watch',
        ])
        .as('library.series.episodes.watch')
      router
        .delete('library/series/:id/seasons/:season/episodes/:episode/watch', [
          controllers.web.Episodes,
          'unwatch',
        ])
        .as('library.series.episodes.unwatch')
      router.delete('library/:id', [controllers.web.Library, 'destroy'])
    })
    .use(middleware.auth())
})

group.as('app').prefix('/app')
