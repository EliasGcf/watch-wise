import { type Data } from '@generated/data'
import { toast, Toaster } from 'sonner'
import { usePage } from '@inertiajs/react'
import { type ReactElement, useEffect } from 'react'
import { Header } from '~/components/header'

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
      {user ? <AppShell>{children}</AppShell> : <main>{children}</main>}
      <Toaster position="top-center" richColors />
    </>
  )
}

function AppShell({ children }: { children: ReactElement<Data.SharedProps> }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <Header />

      <main className="flex-1 overflow-y-auto scrollbar-gutter-stable scrollbar-thin scrollbar-thumb-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  )
}
