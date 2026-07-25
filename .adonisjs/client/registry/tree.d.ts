/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  api: {
    hello: typeof routes['api.hello']
    library: {
      movies: typeof routes['api.library.movies']
      series: typeof routes['api.library.series'] & {
        seasons: {
          episodes: typeof routes['api.library.series.seasons.episodes']
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
        episodes: {
          watch: typeof routes['app.library.series.episodes.watch']
          unwatch: typeof routes['app.library.series.episodes.unwatch']
        }
      }
      movies: {
        watch: typeof routes['app.library.movies.watch']
        unwatch: typeof routes['app.library.movies.unwatch']
      }
      destroy: typeof routes['app.library.destroy']
    }
  }
}
