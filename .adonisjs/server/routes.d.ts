import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies': { paramsTuple?: []; params?: {} }
    'api.library.series': { paramsTuple?: []; params?: {} }
    'api.library.series.seasons': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.library.series.season_episodes': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.new_account.store': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.session.store': { paramsTuple?: []; params?: {} }
    'app.session.destroy': { paramsTuple?: []; params?: {} }
    'app.catalog.search': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
    'app.library.store': { paramsTuple?: []; params?: {} }
    'app.library.series.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.movies.watch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.movies.unwatch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.series.episodes.watch': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue,'episode': ParamValue} }
    'app.library.series.episodes.unwatch': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue,'episode': ParamValue} }
    'app.library.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies': { paramsTuple?: []; params?: {} }
    'api.library.series': { paramsTuple?: []; params?: {} }
    'api.library.series.seasons': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.library.series.season_episodes': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.catalog.search': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
    'app.library.series.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'api.hello': { paramsTuple?: []; params?: {} }
    'api.library.movies': { paramsTuple?: []; params?: {} }
    'api.library.series': { paramsTuple?: []; params?: {} }
    'api.library.series.seasons': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'api.library.series.season_episodes': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue} }
    'app.home': { paramsTuple?: []; params?: {} }
    'app.new_account.create': { paramsTuple?: []; params?: {} }
    'app.session.create': { paramsTuple?: []; params?: {} }
    'app.catalog.search': { paramsTuple?: []; params?: {} }
    'app.library.index': { paramsTuple?: []; params?: {} }
    'app.library.series.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'app.new_account.store': { paramsTuple?: []; params?: {} }
    'app.session.store': { paramsTuple?: []; params?: {} }
    'app.session.destroy': { paramsTuple?: []; params?: {} }
    'app.library.store': { paramsTuple?: []; params?: {} }
    'app.library.movies.watch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.series.episodes.watch': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue,'episode': ParamValue} }
  }
  DELETE: {
    'app.library.movies.unwatch': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'app.library.series.episodes.unwatch': { paramsTuple: [ParamValue,ParamValue,ParamValue]; params: {'id': ParamValue,'season': ParamValue,'episode': ParamValue} }
    'app.library.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}