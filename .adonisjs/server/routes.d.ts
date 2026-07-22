import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.new_account.store': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.session.store': { paramsTuple?: []; params?: {} }
    'app.session.destroy': { paramsTuple?: []; params?: {} }
    'app.catalog_search.index': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.catalog_search.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.catalog_search.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'app.new_account.store': { paramsTuple?: []; params?: {} }
    'app.session.store': { paramsTuple?: []; params?: {} }
    'app.session.destroy': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}