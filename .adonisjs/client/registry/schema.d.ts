/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'api.hello': {
    methods: ["GET","HEAD"]
    pattern: '/api/hello'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'api.library.store': {
    methods: ["POST"]
    pattern: '/api/library'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/library_entry').addLibraryEntryValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/library_entry').addLibraryEntryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/library_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/library_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.user.update': {
    methods: ["PATCH"]
    pattern: '/api/user'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').updateUsernameValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').updateUsernameValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/user_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/user_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.cache.tmdb.clear': {
    methods: ["DELETE"]
    pattern: '/api/cache/tmdb'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/cache_controller').default['clearTmdb']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/cache_controller').default['clearTmdb']>>>
    }
  }
  'api.user.settings.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/user/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/user_settings_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/user_settings_controller').default['show']>>>
    }
  }
  'api.user.settings.update': {
    methods: ["PATCH"]
    pattern: '/api/user/settings'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user_settings').updateUserSettingsValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user_settings').updateUserSettingsValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/user_settings_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/user_settings_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.library.destroy': {
    methods: ["DELETE"]
    pattern: '/api/library/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/library_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/library_controller').default['destroy']>>>
    }
  }
  'api.library.movies.watch': {
    methods: ["POST"]
    pattern: '/api/library/movies/:id/watch'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/movie').watchMovieValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/movie').watchMovieValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/movies_controller').default['watch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/movies_controller').default['watch']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.library.movies.unwatch': {
    methods: ["DELETE"]
    pattern: '/api/library/movies/:id/watch'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/movies_controller').default['unwatch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/movies_controller').default['unwatch']>>>
    }
  }
  'api.library.series.seasons.episodes': {
    methods: ["GET","HEAD"]
    pattern: '/api/library/series/:id/seasons/:season/episodes'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; season: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series/episodes_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series/episodes_controller').default['index']>>>
    }
  }
  'api.library.series.seasons.watch': {
    methods: ["POST"]
    pattern: '/api/library/series/:id/seasons/:season/watch'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue]
      params: { id: ParamValue; season: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series/seasons_controller').default['watch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series/seasons_controller').default['watch']>>>
    }
  }
  'api.library.series.watch': {
    methods: ["POST"]
    pattern: '/api/library/series/:id/watch'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series/seasons_controller').default['watchAll']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series/seasons_controller').default['watchAll']>>>
    }
  }
  'api.library.series.episodes.watch_before': {
    methods: ["POST"]
    pattern: '/api/library/series/:id/seasons/:season/episodes/:episode/watch-before'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { id: ParamValue; season: ParamValue; episode: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series/episodes_controller').default['watchBefore']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series/episodes_controller').default['watchBefore']>>>
    }
  }
  'api.library.series.episodes.watch': {
    methods: ["POST"]
    pattern: '/api/library/series/:id/seasons/:season/episodes/:episode/watch'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/episode').watchEpisodeValidator)>>
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { id: ParamValue; season: ParamValue; episode: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/episode').watchEpisodeValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series/episodes_controller').default['watch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series/episodes_controller').default['watch']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.library.series.episodes.unwatch': {
    methods: ["DELETE"]
    pattern: '/api/library/series/:id/seasons/:season/episodes/:episode/watch'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { id: ParamValue; season: ParamValue; episode: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series/episodes_controller').default['unwatch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series/episodes_controller').default['unwatch']>>>
    }
  }
  'api.library.series.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/library/series'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/library').libraryQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.library.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/library'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/library').libraryQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/library_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/library_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'api.webhooks.seerr': {
    methods: ["POST"]
    pattern: '/api/webhooks/seerr'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/seerr_webhook').seerrWebhookValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/seerr_webhook').seerrWebhookValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/webhooks/seerr_controller').default['handle']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/webhooks/seerr_controller').default['handle']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'app.new_account': {
    methods: ["GET","HEAD"]
    pattern: '/app/signup'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/new_account_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/new_account_controller').default['create']>>>
    }
  }
  'app.new_account.store': {
    methods: ["POST"]
    pattern: '/app/signup'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/user').signupValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/user').signupValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/new_account_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/new_account_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'app.login': {
    methods: ["GET","HEAD"]
    pattern: '/app/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/session_controller').default['create']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/session_controller').default['create']>>>
    }
  }
  'app.session.store': {
    methods: ["POST"]
    pattern: '/app/login'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/session_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/session_controller').default['store']>>>
    }
  }
  'app.home': {
    methods: ["GET","HEAD"]
    pattern: '/app'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/home_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/home_controller').default['index']>>>
    }
  }
  'app.session.destroy': {
    methods: ["POST"]
    pattern: '/app/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/session_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/session_controller').default['destroy']>>>
    }
  }
  'app.catalog.search': {
    methods: ["GET","HEAD"]
    pattern: '/app/catalog/search'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/catalog_search_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/catalog_search_controller').default['index']>>>
    }
  }
  'app.library.index': {
    methods: ["GET","HEAD"]
    pattern: '/app/library'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/library').libraryQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/library_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/library_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'app.library.movies.index': {
    methods: ["GET","HEAD"]
    pattern: '/app/library/movies'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/movies').indexMoviesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/movies_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/movies_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'app.library.series.index': {
    methods: ["GET","HEAD"]
    pattern: '/app/library/series'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: ExtractQueryForGet<InferInput<(typeof import('#validators/library').libraryQueryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/series_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/series_controller').default['index']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'app.library.series.show': {
    methods: ["GET","HEAD"]
    pattern: '/app/library/series/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/series_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/series_controller').default['show']>>>
    }
  }
  'app.settings': {
    methods: ["GET","HEAD"]
    pattern: '/app/settings'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/settings_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/settings_controller').default['index']>>>
    }
  }
}
