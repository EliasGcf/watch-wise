import { usePage } from '@inertiajs/react'

export function useSeerr() {
  const page = usePage()
  return { seerr: page.props.seerr }
}
