/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'api.hello': {
    methods: ["GET","HEAD"],
    pattern: '/api/hello',
    tokens: [{"old":"/api/hello","type":0,"val":"api","end":""},{"old":"/api/hello","type":0,"val":"hello","end":""}],
    types: placeholder as Registry['api.hello']['types'],
  },
  'api.library.movies': {
    methods: ["GET","HEAD"],
    pattern: '/api/library/movies',
    tokens: [{"old":"/api/library/movies","type":0,"val":"api","end":""},{"old":"/api/library/movies","type":0,"val":"library","end":""},{"old":"/api/library/movies","type":0,"val":"movies","end":""}],
    types: placeholder as Registry['api.library.movies']['types'],
  },
  'api.library.series': {
    methods: ["GET","HEAD"],
    pattern: '/api/library/series',
    tokens: [{"old":"/api/library/series","type":0,"val":"api","end":""},{"old":"/api/library/series","type":0,"val":"library","end":""},{"old":"/api/library/series","type":0,"val":"series","end":""}],
    types: placeholder as Registry['api.library.series']['types'],
  },
  'api.library.series.seasons': {
    methods: ["GET","HEAD"],
    pattern: '/api/library/series/:id/seasons',
    tokens: [{"old":"/api/library/series/:id/seasons","type":0,"val":"api","end":""},{"old":"/api/library/series/:id/seasons","type":0,"val":"library","end":""},{"old":"/api/library/series/:id/seasons","type":0,"val":"series","end":""},{"old":"/api/library/series/:id/seasons","type":1,"val":"id","end":""},{"old":"/api/library/series/:id/seasons","type":0,"val":"seasons","end":""}],
    types: placeholder as Registry['api.library.series.seasons']['types'],
  },
  'api.library.series.seasons.episodes': {
    methods: ["GET","HEAD"],
    pattern: '/api/library/series/:id/seasons/:season/episodes',
    tokens: [{"old":"/api/library/series/:id/seasons/:season/episodes","type":0,"val":"api","end":""},{"old":"/api/library/series/:id/seasons/:season/episodes","type":0,"val":"library","end":""},{"old":"/api/library/series/:id/seasons/:season/episodes","type":0,"val":"series","end":""},{"old":"/api/library/series/:id/seasons/:season/episodes","type":1,"val":"id","end":""},{"old":"/api/library/series/:id/seasons/:season/episodes","type":0,"val":"seasons","end":""},{"old":"/api/library/series/:id/seasons/:season/episodes","type":1,"val":"season","end":""},{"old":"/api/library/series/:id/seasons/:season/episodes","type":0,"val":"episodes","end":""}],
    types: placeholder as Registry['api.library.series.seasons.episodes']['types'],
  },
  'app.home': {
    methods: ["GET","HEAD"],
    pattern: '/app',
    tokens: [{"old":"/app","type":0,"val":"app","end":""}],
    types: placeholder as Registry['app.home']['types'],
  },
  'app.new_account.create': {
    methods: ["GET","HEAD"],
    pattern: '/app/signup',
    tokens: [{"old":"/app/signup","type":0,"val":"app","end":""},{"old":"/app/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['app.new_account.create']['types'],
  },
  'app.new_account.store': {
    methods: ["POST"],
    pattern: '/app/signup',
    tokens: [{"old":"/app/signup","type":0,"val":"app","end":""},{"old":"/app/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['app.new_account.store']['types'],
  },
  'app.session.create': {
    methods: ["GET","HEAD"],
    pattern: '/app/login',
    tokens: [{"old":"/app/login","type":0,"val":"app","end":""},{"old":"/app/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['app.session.create']['types'],
  },
  'app.session.store': {
    methods: ["POST"],
    pattern: '/app/login',
    tokens: [{"old":"/app/login","type":0,"val":"app","end":""},{"old":"/app/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['app.session.store']['types'],
  },
  'app.session.destroy': {
    methods: ["POST"],
    pattern: '/app/logout',
    tokens: [{"old":"/app/logout","type":0,"val":"app","end":""},{"old":"/app/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['app.session.destroy']['types'],
  },
  'app.catalog.search': {
    methods: ["GET","HEAD"],
    pattern: '/app/catalog/search',
    tokens: [{"old":"/app/catalog/search","type":0,"val":"app","end":""},{"old":"/app/catalog/search","type":0,"val":"catalog","end":""},{"old":"/app/catalog/search","type":0,"val":"search","end":""}],
    types: placeholder as Registry['app.catalog.search']['types'],
  },
  'app.library.index': {
    methods: ["GET","HEAD"],
    pattern: '/app/library',
    tokens: [{"old":"/app/library","type":0,"val":"app","end":""},{"old":"/app/library","type":0,"val":"library","end":""}],
    types: placeholder as Registry['app.library.index']['types'],
  },
  'app.library.store': {
    methods: ["POST"],
    pattern: '/app/library',
    tokens: [{"old":"/app/library","type":0,"val":"app","end":""},{"old":"/app/library","type":0,"val":"library","end":""}],
    types: placeholder as Registry['app.library.store']['types'],
  },
  'app.library.series.show': {
    methods: ["GET","HEAD"],
    pattern: '/app/library/series/:id',
    tokens: [{"old":"/app/library/series/:id","type":0,"val":"app","end":""},{"old":"/app/library/series/:id","type":0,"val":"library","end":""},{"old":"/app/library/series/:id","type":0,"val":"series","end":""},{"old":"/app/library/series/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['app.library.series.show']['types'],
  },
  'app.library.movies.watch': {
    methods: ["POST"],
    pattern: '/app/library/movies/:id/watch',
    tokens: [{"old":"/app/library/movies/:id/watch","type":0,"val":"app","end":""},{"old":"/app/library/movies/:id/watch","type":0,"val":"library","end":""},{"old":"/app/library/movies/:id/watch","type":0,"val":"movies","end":""},{"old":"/app/library/movies/:id/watch","type":1,"val":"id","end":""},{"old":"/app/library/movies/:id/watch","type":0,"val":"watch","end":""}],
    types: placeholder as Registry['app.library.movies.watch']['types'],
  },
  'app.library.movies.unwatch': {
    methods: ["DELETE"],
    pattern: '/app/library/movies/:id/watch',
    tokens: [{"old":"/app/library/movies/:id/watch","type":0,"val":"app","end":""},{"old":"/app/library/movies/:id/watch","type":0,"val":"library","end":""},{"old":"/app/library/movies/:id/watch","type":0,"val":"movies","end":""},{"old":"/app/library/movies/:id/watch","type":1,"val":"id","end":""},{"old":"/app/library/movies/:id/watch","type":0,"val":"watch","end":""}],
    types: placeholder as Registry['app.library.movies.unwatch']['types'],
  },
  'app.library.series.episodes.watch': {
    methods: ["POST"],
    pattern: '/app/library/series/:id/seasons/:season/episodes/:episode/watch',
    tokens: [{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"app","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"library","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"series","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":1,"val":"id","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"seasons","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":1,"val":"season","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"episodes","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":1,"val":"episode","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"watch","end":""}],
    types: placeholder as Registry['app.library.series.episodes.watch']['types'],
  },
  'app.library.series.episodes.unwatch': {
    methods: ["DELETE"],
    pattern: '/app/library/series/:id/seasons/:season/episodes/:episode/watch',
    tokens: [{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"app","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"library","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"series","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":1,"val":"id","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"seasons","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":1,"val":"season","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"episodes","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":1,"val":"episode","end":""},{"old":"/app/library/series/:id/seasons/:season/episodes/:episode/watch","type":0,"val":"watch","end":""}],
    types: placeholder as Registry['app.library.series.episodes.unwatch']['types'],
  },
  'app.library.destroy': {
    methods: ["DELETE"],
    pattern: '/app/library/:id',
    tokens: [{"old":"/app/library/:id","type":0,"val":"app","end":""},{"old":"/app/library/:id","type":0,"val":"library","end":""},{"old":"/app/library/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['app.library.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
