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
  'api.library.movies.watch': {
    methods: ["POST"]
    pattern: '/api/library/movies/:id/watch'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/movies_controller').default['watch']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/movies_controller').default['watch']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['episodes']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['episodes']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['watchSeason']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['watchSeason']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['watchSeries']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['watchSeries']>>>
    }
  }
  'api.library.series.episodes.watch': {
    methods: ["POST"]
    pattern: '/api/library/series/:id/seasons/:season/episodes/:episode/watch'
    types: {
      body: {}
      paramsTuple: [ParamValue, ParamValue, ParamValue]
      params: { id: ParamValue; season: ParamValue; episode: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['watchEpisode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['watchEpisode']>>>
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
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['unwatchEpisode']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/api/series_controller').default['unwatchEpisode']>>>
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
      response: unknown
      errorResponse: unknown
    }
  }
  'app.new_account.create': {
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
  'app.session.create': {
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
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/library_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/library_controller').default['index']>>>
    }
  }
  'app.library.store': {
    methods: ["POST"]
    pattern: '/app/library'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/library_entry').addLibraryEntryValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/library_entry').addLibraryEntryValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/library_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/library_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
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
  'app.library.destroy': {
    methods: ["DELETE"]
    pattern: '/app/library/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/web/library_controller').default['destroy']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/web/library_controller').default['destroy']>>>
    }
  }
}
