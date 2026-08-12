import { Form, Link } from '@adonisjs/inertia/react'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

export default function Signup() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your details below to start tracking your library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form route="app.new_account.store">
            {({ errors }) => (
              <FieldGroup>
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    required
                  />
                  <FieldError>{errors.fullName}</FieldError>
                </Field>

                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    required
                  />
                  <FieldError>{errors.email}</FieldError>
                </Field>

                <Field data-invalid={!!errors.password}>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    required
                  />
                  <FieldError>{errors.password}</FieldError>
                </Field>

                <Field data-invalid={!!errors.passwordConfirmation}>
                  <FieldLabel htmlFor="passwordConfirmation">Confirm password</FieldLabel>
                  <Input
                    id="passwordConfirmation"
                    name="passwordConfirmation"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.passwordConfirmation}
                    required
                  />
                  <FieldError>{errors.passwordConfirmation}</FieldError>
                </Field>

                <Field>
                  <Button type="submit">Sign up</Button>
                </Field>
              </FieldGroup>
            )}
          </Form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            Already have an account? <Link route="app.session.create">Login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
