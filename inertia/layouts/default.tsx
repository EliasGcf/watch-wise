import { type Data } from '@generated/data'
import { Form, Link } from '@adonisjs/inertia/react'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { type ReactElement, useEffect } from 'react'
import { buttonVariants } from '~/components/ui/button'
import { cn } from '~/lib/utils'

type Props = { children: ReactElement<Data.SharedProps> }

export default function Layout({ children }: Props) {
  const { url } = usePage()
  const user = children.props.user

  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (children.props.flash.error) {
      toast.error(children.props.flash.error)
    }

    if (children.props.flash.success) {
      toast.success(children.props.flash.success)
    }
  })

  return (
    <>
      {user ? <AppShell url={url}>{children}</AppShell> : <main>{children}</main>}
      <Toaster position="top-center" richColors />
    </>
  )
}

function AppShell({ children, url }: { children: ReactElement<Data.SharedProps>; url: string }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/app" className="text-lg font-semibold tracking-tight">
              Watch Wise
            </Link>
            <span className="hidden text-xs uppercase tracking-[0.25em] text-muted-foreground sm:inline">
              Library tracker
            </span>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Main navigation">
            <NavLink href="/app" current={url === '/app'}>
              Home
            </NavLink>
            <NavLink href="/app/library" current={url.startsWith('/app/library')}>
              Library
            </NavLink>
            <NavLink href="/app/catalog/search" current={url.startsWith('/app/catalog')}>
              Catalog
            </NavLink>
            <Form action="/app/logout" method="post">
              <button className={buttonVariants({ variant: 'ghost', size: 'sm' })} type="submit">
                Logout
              </button>
            </Form>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</main>
    </div>
  )
}

function NavLink({
  href,
  current,
  children,
}: {
  href: string
  current: boolean
  children: string
}) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={cn(
        buttonVariants({ variant: current ? 'secondary' : 'ghost', size: 'sm' }),
        current && 'text-foreground'
      )}
    >
      {children}
    </Link>
  )
}
