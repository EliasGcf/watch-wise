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
      {user ? <AppShell url={url}>{children}</AppShell> : <main>{children}</main>}
      <Toaster position="top-center" richColors />
    </>
  )
}

function AppShell({ children, url }: { children: ReactElement<Data.SharedProps>; url: string }) {
  return (
    <div className="min-h-screen bg-background">
      <Header url={url} />

      <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 lg:py-10">{children}</main>
    </div>
  )
}
