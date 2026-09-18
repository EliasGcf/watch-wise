import { usePage } from '@inertiajs/react'
import { Link } from '@adonisjs/inertia/react'
import { LogOutIcon, TimerIcon } from 'lucide-react'

import { NavLink } from '~/components/nav_link'
import { Button } from '~/components/ui/button'
import { LogOutAlertDialog } from '~/components/log_out_alert_dialog'

import { formatWatchedTime } from '~/lib/utils'

export function Header() {
  const { props } = usePage()

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap sm:justify-between sm:px-8">
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 sm:flex-none">
          <Link route="app.home" className="text-lg font-semibold tracking-tight">
            Watch Wise
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.25em] text-muted-foreground lg:inline">
            Library tracker
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
          <TimerIcon className="size-4" />
          <span className="text-sm">{formatWatchedTime(props.user?.watchedTime ?? 0)}</span>
        </div>

        <nav
          className="hidden md:flex basis-full flex-wrap items-center gap-2 text-sm md:basis-auto"
          aria-label="Main navigation"
        >
          <NavLink route="app.home">Home</NavLink>
          <NavLink route="app.library.index">Library</NavLink>
          <NavLink route="app.catalog.search">Catalog</NavLink>
          <NavLink route="app.settings">Settings</NavLink>

          <LogOutAlertDialog>
            <Button variant="destructive" size="icon-sm" className="bg-transparent">
              <LogOutIcon className="text-destructive" />
            </Button>
          </LogOutAlertDialog>
        </nav>
      </div>
    </header>
  )
}
