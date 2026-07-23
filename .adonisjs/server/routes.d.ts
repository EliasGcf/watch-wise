import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies.index': { paramsTuple?: []; params?: {} }
    'api.library.series.index': { paramsTuple?: []; params?: {} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.new_account.store': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.session.store': { paramsTuple?: []; params?: {} }
    'app.session.destroy': { paramsTuple?: []; params?: {} }
    'app.catalog_search.index': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
    'app.library.store': { paramsTuple?: []; params?: {} }
    'app.library.watched.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.watched.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies.index': { paramsTuple?: []; params?: {} }
    'api.library.series.index': { paramsTuple?: []; params?: {} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.catalog_search.index': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies.index': { paramsTuple?: []; params?: {} }
    'api.library.series.index': { paramsTuple?: []; params?: {} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.catalog_search.index': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'app.new_account.store': { paramsTuple?: []; params?: {} }
    'app.session.store': { paramsTuple?: []; params?: {} }
    'app.session.destroy': { paramsTuple?: []; params?: {} }
    'app.library.store': { paramsTuple?: []; params?: {} }
    'app.library.watched.store': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'app.library.watched.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}