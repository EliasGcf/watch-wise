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
  'app.catalog_search.index': {
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
}
