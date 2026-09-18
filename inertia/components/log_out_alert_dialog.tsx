import { Form } from '@adonisjs/inertia/react'
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
  children: React.ReactElement
}

export function LogOutAlertDialog({ children }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger aria-label="Log out" render={children} />

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
