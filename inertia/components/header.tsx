import { Form, Link, type LinkProps } from '@adonisjs/inertia/react'
import { usePage } from '@inertiajs/react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert_dialog'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'

export function Header() {
  const { url } = usePage()

  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link route="app.home" className="text-lg font-semibold tracking-tight">
            Watch Wise
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.25em] text-muted-foreground md:inline">
            Library tracker
          </span>
        </div>

        <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Main navigation">
          <NavLink route="app.home" current={url === '/app'}>
            Home
          </NavLink>
          <NavLink route="app.library.index" current={url.startsWith('/app/library')}>
            Library
          </NavLink>
          <NavLink route="app.catalog.search" current={url.startsWith('/app/catalog')}>
            Catalog
          </NavLink>
          <NavLink route="app.settings" current={url.startsWith('/app/settings')}>
            Settings
          </NavLink>
          <AlertDialog>
            <AlertDialogTrigger
              className={buttonVariants({ variant: 'destructive', size: 'sm' })}
              aria-label="Log out"
            >
              Logout
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to log out of your account?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Form action="/app/logout" method="post">
                  <AlertDialogAction type="submit" variant="destructive" className="w-full">
                    Logout
                  </AlertDialogAction>
                </Form>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </nav>
      </div>
    </header>
  )
}

function NavLink({ current, ...props }: LinkProps & { current: boolean }) {
  return (
    <Link
      aria-current={current ? 'page' : undefined}
      className={cn(
        buttonVariants({ variant: current ? 'secondary' : 'ghost', size: 'sm' }),
        current && 'text-foreground'
      )}
      {...props}
    />
  )
}
