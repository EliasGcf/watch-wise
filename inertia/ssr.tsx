import { type ComponentType, type ReactElement } from 'react'
import Layout from '~/layouts/default'
import { type Data } from '@generated/data'
import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import { AppProviders } from '~/providers'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: async (name) => {
      const resolvedPage = await resolvePageComponent(
        `./pages/${name}.tsx`,
        import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx', { eager: true }),
        (element: ReactElement<Data.SharedProps>) => <Layout children={element} />
      )

      return resolvedPage.default
    },
    setup: ({ App, props }) => {
      return (
        <AppProviders withTheme={false}>
          <App {...props} />
        </AppProviders>
      )
    },
  })
}
