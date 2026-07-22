import { controllers } from '#generated/controllers'
import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const LibraryController = () => import('#controllers/web/library_controller')

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
      router.get('library', [LibraryController, 'index']).as('library.index')
      router.post('library', [LibraryController, 'store']).as('library.store')
    })
    .use(middleware.auth())
})

group.as('app').prefix('/app')
