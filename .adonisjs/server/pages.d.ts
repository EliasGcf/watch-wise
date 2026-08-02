import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'catalog/search': ExtractProps<(typeof import('../../inertia/pages/catalog/search.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'library/index': ExtractProps<(typeof import('../../inertia/pages/library/index.tsx'))['default']>
    'library/series/show': ExtractProps<(typeof import('../../inertia/pages/library/series/show.tsx'))['default']>
    'library/components/library_cards': ExtractProps<(typeof import('../../inertia/pages/library/components/library_cards.tsx'))['default']>
    'library/movies': ExtractProps<(typeof import('../../inertia/pages/library/movies.tsx'))['default']>
    'library/series/index': ExtractProps<(typeof import('../../inertia/pages/library/series/index.tsx'))['default']>
  }
}
