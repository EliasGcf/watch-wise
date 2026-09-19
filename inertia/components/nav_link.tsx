import { Link, type LinkProps } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'

import { urlFor } from '~/client'

type SafeOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

type NavLinkProps = SafeOmit<LinkProps, 'className'> & {
  className?: string | ((current: boolean) => string)
}

export function NavLink({ className, ...props }: NavLinkProps) {
  const { url } = usePage()
  const current = props.route ? url === urlFor(props.route) : props.href === url

  const newClassName = typeof className === 'function' ? className(current) : className

  return <Link data-current={current ? '' : undefined} className={newClassName} {...props} />
}
