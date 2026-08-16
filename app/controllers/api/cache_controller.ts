import cacheService from '@adonisjs/cache/services/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class CacheController {
  async clearTmdb({ response }: HttpContext) {
    // ponytail: cache only holds TMDB catalog lookups today, so clearing the store clears the TMDB cache
    await cacheService.clear()
    return response.noContent()
  }
}
