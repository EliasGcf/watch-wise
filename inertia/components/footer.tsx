import { HomeIcon, ListIcon, LogOutIcon, SearchIcon, SettingsIcon } from 'lucide-react'

import { LogOutAlertDialog } from '~/components/log_out_alert_dialog'
import { NavLink } from '~/components/nav_link'

export function Footer() {
  return (
    <footer className="md:hidden border-t bg-background/95 backdrop-blur px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <nav className="flex justify-between">
        <NavLink route="app.home" className="bg-transparent data-current:text-primary">
          <HomeIcon className="size-6" />
        </NavLink>

        <NavLink route="app.library.index" className="bg-transparent data-current:text-primary">
          <ListIcon className="size-6" />
        </NavLink>

        <NavLink route="app.catalog.search" className="bg-transparent data-current:text-primary">
          <SearchIcon className="size-6" />
        </NavLink>

        <NavLink route="app.settings" className="bg-transparent data-current:text-primary">
          <SettingsIcon className="size-6" />
        </NavLink>

        <LogOutAlertDialog>
          <LogOutIcon className="size-6 text-destructive" />
        </LogOutAlertDialog>
      </nav>
    </footer>
  )
}
