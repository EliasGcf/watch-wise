import router from '@adonisjs/core/services/router'

const group = router.group(() => {
  router.get('hello', () => ({ message: 'Hello from Watch Wise' })).as('hello')
})

group.as('api').prefix('/api')
