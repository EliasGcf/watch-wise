import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { LogOutIcon } from 'lucide-react'

import { NavLink } from '~/components/nav_link'
import { Button, buttonVariants } from '~/components/ui/button'
import { LogOutAlertDialog } from '~/components/log_out_alert_dialog'

import { formatWatchedTime } from '~/lib/utils'
import { type RouteNames } from '~/client'
import { useRef } from 'react'
import { TimerIcon, type TimerIconHandle } from '~/components/ui/timer_icon'
import { useAfterFirstRender } from '~/hooks/use_after_first_render'

const LINKS = [
  { route: 'app.home', name: 'Home' },
  { route: 'app.library.index', name: 'Library' },
  { route: 'app.catalog.search', name: 'Catalog' },
  { route: 'app.settings', name: 'Settings' },
] satisfies { route: RouteNames; name: string }[]

export function Header() {
  const iconRef = useRef<TimerIconHandle>(null)
  const { props } = usePage()

  function getLinkClassName(current: boolean) {
    return buttonVariants({ variant: current ? 'secondary' : 'ghost', size: 'sm' })
  }

  useAfterFirstRender(() => {
    iconRef.current?.startAnimation()
  }, [props.user?.watchedTime])

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
          <TimerIcon ref={iconRef} className="size-4" size={16} />
          <span className="text-sm tabular-nums">
            {formatWatchedTime(props.user?.watchedTime ?? 0)}
          </span>
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
