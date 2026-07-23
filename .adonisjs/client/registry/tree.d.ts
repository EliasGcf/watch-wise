/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  api: {
    hello: typeof routes['api.hello']
    library: {
      movies: typeof routes['api.library.movies']
      series: typeof routes['api.library.series']
    }
  }
  app: {
    home: typeof routes['app.home']
    newAccount: {
      create: typeof routes['app.new_account.create']
      store: typeof routes['app.new_account.store']
    }
    session: {
      create: typeof routes['app.session.create']
      store: typeof routes['app.session.store']
      destroy: typeof routes['app.session.destroy']
    }
    catalog: {
      search: typeof routes['app.catalog.search']
    }
    library: {
      index: typeof routes['app.library.index']
      store: typeof routes['app.library.store']
      watch: typeof routes['app.library.watch']
      unwatch: typeof routes['app.library.unwatch']
    }
  }
}
