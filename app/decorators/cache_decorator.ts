import cacheService from '@adonisjs/cache/services/main'
import { type Duration } from '@adonisjs/cache/types'
import config from '@adonisjs/core/services/config'

export const defaultTtl = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

type CacheDecoratorDefaults = {
  prefixKey?: string
  ttl?: Duration | ((result: any) => string | number)
}

type AnyMethod = (...args: any[]) => any

export function createCacheDecorator(defaults: CacheDecoratorDefaults = {}) {
  return function cache(options: CacheDecoratorDefaults = {}): MethodDecorator {
    const prefixKey = options.prefixKey ?? defaults.prefixKey
    const ttl = options.ttl ?? defaults.ttl ?? defaultTtl

    return function (
      _target: object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ): PropertyDescriptor {
      const original = descriptor.value as AnyMethod

      descriptor.value = async function (this: unknown, ...args: any[]) {
        const key = [prefixKey, String(propertyKey), ...args].filter(Boolean).join(':')

        if (!config.get('cache.enabled')) return original.apply(this, args)

        try {
          return await cacheService.getOrSet({
            key,
            ttl: typeof ttl === 'function' ? undefined : ttl,
            factory: async (ctx) => {
              if (typeof ttl !== 'function') return original.apply(this, args)

              const result = await original.apply(this, args)
              ctx.setOptions({ ttl: ttl(result) })
              return result
            },
          })
        } catch (error) {
          if (error instanceof Error && error.cause instanceof Error) {
            throw error.cause
          }

          throw error
        }
      }

      return descriptor
    }
  }
}

export const cache = createCacheDecorator()
