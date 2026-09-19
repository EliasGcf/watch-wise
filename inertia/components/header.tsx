import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { LogOutIcon, TimerIcon } from 'lucide-react'

import { NavLink } from '~/components/nav_link'
import { Button, buttonVariants } from '~/components/ui/button'
import { LogOutAlertDialog } from '~/components/log_out_alert_dialog'

import { formatWatchedTime } from '~/lib/utils'
import { type RouteNames } from '~/client'

const LINKS = [
  { route: 'app.home', name: 'Home' },
  { route: 'app.library.index', name: 'Library' },
  { route: 'app.catalog.search', name: 'Catalog' },
  { route: 'app.settings', name: 'Settings' },
] satisfies { route: RouteNames; name: string }[]

export function Header() {
  const { props } = usePage()

  function getLinkClassName(current: boolean) {
    return buttonVariants({ variant: current ? 'secondary' : 'ghost', size: 'sm' })
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap md:justify-between sm:px-8">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 md:flex-none">
          <Link route="app.home" className="text-lg font-semibold tracking-tight">
            Watch Wise
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.25em] text-muted-foreground lg:inline">
            Library tracker
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-muted-foreground">
          <TimerIcon className="size-4" />
          <span className="text-sm">{formatWatchedTime(props.user?.watchedTime ?? 0)}</span>
        </div>

        <div className="flex">
          <nav
            className="hidden md:flex basis-full flex-wrap items-center gap-2 text-sm md:basis-auto"
            aria-label="Main navigation"
          >
            {LINKS.map((link) => (
              <NavLink key={link.route} className={getLinkClassName} route={link.route}>
                {link.name}
              </NavLink>
            ))}
          </nav>
          <LogOutAlertDialog
            render={
              <Button variant="destructive" size="icon-sm" className="bg-transparent">
                <LogOutIcon className="text-destructive" />
              </Button>
            }
          />
        </div>
      </div>
    </header>
  )
}
