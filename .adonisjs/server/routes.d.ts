import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies': { paramsTuple?: []; params?: {} }
    'api.library.series': { paramsTuple?: []; params?: {} }
    'api.library.series.episodes': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.new_account.store': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.session.store': { paramsTuple?: []; params?: {} }
    'app.session.destroy': { paramsTuple?: []; params?: {} }
    'app.catalog.search': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
    'app.library.store': { paramsTuple?: []; params?: {} }
    'app.library.watch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.unwatch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.watch_episode': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue,'episode': ParamValue} }
    'app.library.unwatch_episode': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue,'episode': ParamValue} }
    'app.library.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies': { paramsTuple?: []; params?: {} }
    'api.library.series': { paramsTuple?: []; params?: {} }
    'api.library.series.episodes': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.catalog.search': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies': { paramsTuple?: []; params?: {} }
    'api.library.series': { paramsTuple?: []; params?: {} }
    'api.library.series.episodes': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.catalog.search': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
  }
  POST: {
    'app.new_account.store': { paramsTuple?: []; params?: {} }
    'app.session.store': { paramsTuple?: []; params?: {} }
    'app.session.destroy': { paramsTuple?: []; params?: {} }
    'app.library.store': { paramsTuple?: []; params?: {} }
    'app.library.watch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.watch_episode': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue,'episode': ParamValue} }
  }
  DELETE: {
    'app.library.unwatch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.unwatch_episode': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue,'episode': ParamValue} }
    'app.library.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}