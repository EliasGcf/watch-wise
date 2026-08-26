import { router } from '@inertiajs/react'

export function reloadOnHistoryNavigation() {
  let restoringHistory = false

  window.addEventListener('popstate', () => (restoringHistory = true))
  router.on('navigate', () => {
    if (!restoringHistory) return

    restoringHistory = false
    router.reload()
  })
}
