/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  api: {
    hello: typeof routes['api.hello']
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
    catalogSearch: {
      index: typeof routes['app.catalog_search.index']
    }
    library: {
      index: typeof routes['app.library.index']
      movies: {
        index: typeof routes['app.library.movies.index']
      }
      series: {
        index: typeof routes['app.library.series.index']
      }
      store: typeof routes['app.library.store']
      watched: {
        store: typeof routes['app.library.watched.store']
        destroy: typeof routes['app.library.watched.destroy']
      }
    }
  }
}
