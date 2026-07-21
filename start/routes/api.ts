import router from '@adonisjs/core/services/router'

const group = router.group(() => {})

group.as('api').prefix('/api')
