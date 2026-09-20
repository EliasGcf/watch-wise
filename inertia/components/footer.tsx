import {} from //
// HomeIcon,
// ListIcon,
// SearchIcon,
// SettingsIcon,
'lucide-react'

import { NavLink } from '~/components/nav_link'
import { HomeIcon, type HomeIconHandle as IconHandle } from '~/components/ui/home_icon'
import { ListIcon } from '~/components/ui/list_icon'
import { SearchIcon } from '~/components/ui/search_icon'
import { SettingsIcon } from '~/components/ui/settings_icon'
import { useRef } from 'react'

const LINKS = {
  className: 'data-current:text-primary p-3',
  items: [
    {
      route: 'app.home',
      icon: HomeIcon,
    },
    {
      route: 'app.library.index',
      icon: ListIcon,
    },
    {
      route: 'app.catalog.search',
      icon: SearchIcon,
    },
    {
      route: 'app.settings',
      icon: SettingsIcon,
    },
  ],
} as const

function FooterNavLink({ link }: { link: (typeof LINKS.items)[number] }) {
  const iconRef = useRef<IconHandle>(null)

  function handleLinkClick() {
    iconRef.current?.startAnimation()
  }

  return (
    <NavLink
      key={link.route}
      route={link.route}
      onClick={handleLinkClick}
      className={LINKS.className}
    >
      <link.icon ref={iconRef} />
    </NavLink>
  )
}

export function Footer() {
  return (
    <footer className="md:hidden border-t bg-background/95 backdrop-blur px-3 py-2 pb-[max(0.5rem,calc(env(safe-area-inset-bottom)-0.625rem))]">
      <nav className="flex justify-between">
        {LINKS.items.map((link) => (
          <FooterNavLink key={link.route} link={link} />
        ))}
      </nav>
    </footer>
  )
}
