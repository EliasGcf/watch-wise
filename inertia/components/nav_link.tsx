import { Link, type LinkProps } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'

import { urlFor } from '~/client'
import { useAfterFirstRender } from '~/hooks/use_after_first_render'

type SafeOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

type NavLinkProps = SafeOmit<LinkProps, 'className'> & {
  className?: string | ((current: boolean) => string)
  onCurrentChange?: (current: boolean) => void
}

export function NavLink({ className, onCurrentChange, ...props }: NavLinkProps) {
  const { url } = usePage()
  const current = props.route ? url === urlFor(props.route) : props.href === url

  useAfterFirstRender(() => {
    onCurrentChange?.(current)
  }, [current])

  const newClassName = typeof className === 'function' ? className(current) : className

  return <Link data-current={current ? '' : undefined} className={newClassName} {...props} />
}
