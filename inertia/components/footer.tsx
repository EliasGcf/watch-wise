import { HomeIcon, ListIcon, SearchIcon, SettingsIcon } from 'lucide-react'

import { NavLink } from '~/components/nav_link'
import { type RouteNames } from '~/client'
import { type ClassValue } from 'clsx'
import { cn } from '~/lib/utils'

const LINKS = {
  className: 'data-current:text-primary p-3',
  items: [
    {
      route: 'app.home',
      icon: <HomeIcon className="size-6" />,
    },
    {
      route: 'app.library.index',
      icon: <ListIcon className="size-6" />,
    },
    {
      route: 'app.catalog.search',
      icon: <SearchIcon className="size-6" />,
    },
    {
      route: 'app.settings',
      icon: <SettingsIcon className="size-6" />,
    },
  ] as { route: RouteNames; icon: React.ReactNode; className?: ClassValue }[],
}

export function Footer() {
  return (
    <footer className="md:hidden border-t bg-background/95 backdrop-blur px-3 py-2 pb-[max(0.5rem,calc(env(safe-area-inset-bottom)-0.625rem))]">
      <nav className="flex justify-between">
        {LINKS.items.map((link) => (
          <NavLink
            key={link.route}
            route={link.route}
            className={cn(LINKS.className, link.className)}
          >
            {link.icon}
          </NavLink>
        ))}
      </nav>
    </footer>
  )
}
