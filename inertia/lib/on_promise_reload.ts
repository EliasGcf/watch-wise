import { router } from '@inertiajs/react'

export async function reload(opts?: Parameters<typeof router.reload>[0]) {
  return new Promise<void>((resolve, reject) => {
    router.reload({
      ...opts,
      onFinish: (visit) => {
        if (opts?.onFinish) opts.onFinish(visit)
        resolve()
      },
      onError: (errors) => {
        if (opts?.onError) opts.onError(errors)
        reject(errors)
      },
    })
  })
}
