import { router } from '@inertiajs/react'

export function reloadOnHistoryNavigation() {
  let restoringHistory = false

  window.addEventListener('popstate', () => (restoringHistory = true))

  router.on('navigate', (event) => {
    if (!restoringHistory) return

    restoringHistory = false
    router.reload({ only: Object.keys(event.detail.page.scrollProps ?? {}) })
  })
}
