import cacheService from '@adonisjs/cache/services/main'
import config from '@adonisjs/core/services/config'

const defaultTtl = '24h'

type CacheDecoratorDefaults = {
  prefixKey?: string
  ttl?: string
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
            ttl,
            factory: () => original.apply(this, args),
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
