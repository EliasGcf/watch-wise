/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
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
  'app.catalog_search.index': {
    methods: ["GET","HEAD"],
    pattern: '/app/catalog/search',
    tokens: [{"old":"/app/catalog/search","type":0,"val":"app","end":""},{"old":"/app/catalog/search","type":0,"val":"catalog","end":""},{"old":"/app/catalog/search","type":0,"val":"search","end":""}],
    types: placeholder as Registry['app.catalog_search.index']['types'],
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
