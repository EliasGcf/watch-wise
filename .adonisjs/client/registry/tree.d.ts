/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  api: {
    hello: typeof routes['api.hello']
    library: {
      store: typeof routes['api.library.store']
      destroy: typeof routes['api.library.destroy']
      movies: {
        watch: typeof routes['api.library.movies.watch']
        unwatch: typeof routes['api.library.movies.unwatch']
      }
      series: {
        seasons: {
          episodes: typeof routes['api.library.series.seasons.episodes']
          watch: typeof routes['api.library.series.seasons.watch']
        }
        watch: typeof routes['api.library.series.watch']
        episodes: {
          watchBefore: typeof routes['api.library.series.episodes.watch_before']
          watch: typeof routes['api.library.series.episodes.watch']
          unwatch: typeof routes['api.library.series.episodes.unwatch']
        }
      }
    }
    user: {
      update: typeof routes['api.user.update']
      settings: {
        show: typeof routes['api.user.settings.show']
        update: typeof routes['api.user.settings.update']
      }
    }
    cache: {
      tmdb: {
        clear: typeof routes['api.cache.tmdb.clear']
      }
    }
  }
  app: {
    newAccount: typeof routes['app.new_account'] & {
      store: typeof routes['app.new_account.store']
    }
    login: typeof routes['app.login']
    session: {
      store: typeof routes['app.session.store']
      destroy: typeof routes['app.session.destroy']
    }
    home: typeof routes['app.home']
    catalog: {
      search: typeof routes['app.catalog.search']
    }
    library: {
      index: typeof routes['app.library.index']
      movies: {
        index: typeof routes['app.library.movies.index']
      }
      series: {
        index: typeof routes['app.library.series.index']
        show: typeof routes['app.library.series.show']
      }
    }
    settings: typeof routes['app.settings']
  }
}
