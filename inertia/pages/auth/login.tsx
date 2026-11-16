import { Form, Link } from '@adonisjs/inertia/react'
import { Button, buttonVariants } from '~/components/ui/button'
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

export default function Login({ oidcEnabled }: { oidcEnabled: boolean }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to Watch Wise</CardTitle>
          <CardDescription>
            Enter your email or username and password to access your library.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {oidcEnabled && (
            <div className="mb-4 flex flex-col gap-4">
              <Link
                route="app.oidc.redirect"
                className={buttonVariants({ variant: 'outline', className: 'w-full' })}
              >
                Sign in with SSO
              </Link>
              <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
                or
              </p>
            </div>
          )}

          <Form route="app.session.store">
            {({ errors }) => (
              <FieldGroup>
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email or username</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="username"
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
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    required
                  />
                  <FieldError>{errors.password}</FieldError>
                </Field>

                <Field>
                  <Button type="submit">Login</Button>
                </Field>
              </FieldGroup>
            )}
          </Form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-sm text-muted-foreground">
            Don&apos;t have an account? <Link route="app.new_account">Sign up</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
