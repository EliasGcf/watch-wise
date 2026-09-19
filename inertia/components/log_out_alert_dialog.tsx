import { Form } from '@adonisjs/inertia/react'
import { type ComponentProps } from 'react'
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

type Props = {
  children?: React.ReactElement
  render?: ComponentProps<typeof AlertDialogTrigger>['render']
  className?: string
}

export function LogOutAlertDialog({ children, render, className }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className={className} aria-label="Log out" render={render}>
        {children}
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
  )
}
