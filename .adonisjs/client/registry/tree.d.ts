/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  api: {
    hello: typeof routes['api.hello']
    library: {
      movies: {
        watch: typeof routes['api.library.movies.watch']
        unwatch: typeof routes['api.library.movies.unwatch']
      }
      series: {
        seasons: {
          episodes: typeof routes['api.library.series.seasons.episodes']
        }
        episodes: {
          watch: typeof routes['api.library.series.episodes.watch']
          unwatch: typeof routes['api.library.series.episodes.unwatch']
        }
      }
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
      series: {
        show: typeof routes['app.library.series.show']
      }
      destroy: typeof routes['app.library.destroy']
    }
  }
}
