import './css/app.css'
import { type ComponentType, type ReactElement } from 'react'
import Layout from '~/layouts/default'
import { type Data } from '@generated/data'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { AppProviders } from '~/providers'
import { reloadOnHistoryNavigation } from '~/lib/reload_on_history_navigation'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

const appName = import.meta.env.VITE_APP_NAME || 'Watch Wise'

reloadOnHistoryNavigation()

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: async (name) => {
    const page = await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx'),
      (element: ReactElement<Data.SharedProps>) => <Layout children={element} />
    )

    return page.default
  },
  setup({ el, App, props }) {
    createRoot(el).render(
      <AppProviders>
        <App {...props} />
      </AppProviders>
    )
  },
  progress: {
    color: '#4B5563',
  },
})
