import { Link, type LinkProps } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'

import { buttonVariants } from '~/components/ui/button'

import { cn } from '~/lib/utils'

import { urlFor } from '~/client'

type NavLinkProps = LinkProps

export function NavLink({ className, ...props }: NavLinkProps) {
  const { url } = usePage()
  const current = props.route ? url === urlFor(props.route) : props.href === url

  return (
    <Link
      aria-current={current ? 'page' : undefined}
      data-current={current ? '' : undefined}
      className={cn(
        buttonVariants({ variant: current ? 'secondary' : 'ghost', size: 'sm' }),
        current && 'text-foreground',
        className
      )}
      {...props}
    />
  )
}
