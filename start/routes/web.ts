import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const group = router.group(() => {
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
      router.get('/', [controllers.web.Home, 'index']).as('home')
      router.post('logout', [controllers.web.Session, 'destroy'])
      router.get('catalog/search', [controllers.web.CatalogSearch, 'index']).as('catalog.search')
      router.get('library', [controllers.web.Library, 'index'])
      router.get('library/series/:id', [controllers.web.Series, 'show']).as('library.series.show')
    })
    .use(middleware.auth())
})

group.as('app').prefix('/app')
