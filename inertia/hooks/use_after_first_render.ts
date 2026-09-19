import { useEffect, useRef } from 'react'

/**
 * This is a useEffect wrapper that will only run the effect after the first render.
 * This is useful for cases where you want to run an effect only when a dependency changes, but not on the initial render.
 * The is the same as useEffect, but the callback will not run on the first render.
 */
export function useAfterFirstRender(callback: () => void, deps: React.DependencyList) {
  const isFirstRender = useRef(true)

  // The dependency list is intentionally forwarded by this wrapper. Callers are
  // responsible for passing every value used by their callback in `deps`.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    return callback()
  }, deps)
  /* eslint-enable react-hooks/exhaustive-deps */
}
