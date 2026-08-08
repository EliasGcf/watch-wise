import { useMutation } from '@tanstack/react-query'
import { type Data } from '@generated/data'
import { LoaderCircle } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldLabel } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { api } from '~/client'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{
  settings: Data.UserSettings
  providerAvailability: {
    sonarr: boolean
    radarr: boolean
  }
}>

type PendingIntegration = 'sonarr' | 'radarr' | null

export default function Settings({ user, settings, providerAvailability }: Props) {
  const [sonarrChecked, setSonarrChecked] = useState(settings.deleteSonarrEpisodeFiles)
  const [radarrChecked, setRadarrChecked] = useState(settings.deleteRadarrMovieFiles)
  const [pendingIntegration, setPendingIntegration] = useState<PendingIntegration>(null)
  const [username, setUsername] = useState(user?.username ?? '')

  const updateSettings = useMutation(
    api.api.user.settings.update.mutationOptions({
      onSuccess: () => toast.success('Settings saved.'),
      onError: () => toast.error('Settings could not be saved.'),
    })
  )

  const updateUsername = useMutation(
    api.api.user.update.mutationOptions({
      onSuccess: () => toast.success('Username saved.'),
      onError: () => toast.error('Username could not be saved.'),
    })
  )

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Settings</h1>
        <p className="max-w-2xl text-muted-foreground">
          Manage how Watch Wise behaves for your library and connected services.
        </p>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="settings-profile">
        <div className="flex flex-col gap-1 border-b pb-3">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Profile</p>
          <h2 id="settings-profile" className="text-2xl font-semibold tracking-tight">
            Login details
          </h2>
        </div>

        <Field>
          <FieldLabel htmlFor="username">Username</FieldLabel>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              placeholder="Letters, numbers and underscores"
              className="md:w-72"
            />
            <Button
              type="button"
              onClick={() => updateUsername.mutate({ body: { username } })}
              disabled={updateUsername.isPending || (!!user?.username && !username)}
            >
              {updateUsername.isPending && (
                <LoaderCircle className="size-4 animate-spin" aria-label="Saving" />
              )}
              Save
            </Button>
          </div>
          <FieldDescription>
            {user?.username
              ? 'Your username is used to log in. If you change it, you sign in with the new one.'
              : 'Set a username to log in with it instead of your email.'}
          </FieldDescription>
        </Field>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="settings-services">
        <div className="flex flex-col gap-1 border-b pb-3">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Services</p>
          <h2 id="settings-services" className="text-2xl font-semibold tracking-tight">
            Connected services
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <IntegrationCard
            name="Sonarr"
            available={providerAvailability.sonarr}
            description="Episode cleanup for watched entries."
            unavailableMessage="Sonarr is unavailable because no Sonarr provider is configured."
          >
            <ProviderToggle
              id="delete-sonarr-episode-files"
              label="Delete watched episode files"
              description="After you mark an episode watched, remove its Sonarr-managed file."
              checked={sonarrChecked}
              disabled={updateSettings.isPending}
              pending={pendingIntegration === 'sonarr'}
              onChange={(checked) => {
                setSonarrChecked(checked)
                setPendingIntegration('sonarr')
                updateSettings.mutate(
                  { body: { deleteSonarrEpisodeFiles: checked } },
                  {
                    onError: () => setSonarrChecked(!checked),
                    onSettled: () => setPendingIntegration(null),
                  }
                )
              }}
            />
          </IntegrationCard>

          <IntegrationCard
            name="Radarr"
            available={providerAvailability.radarr}
            description="Movie cleanup for completed watches."
            unavailableMessage="Radarr is unavailable because no Radarr provider is configured."
          >
            <ProviderToggle
              id="delete-radarr-movie-files"
              label="Delete watched movie files"
              description="After you mark a movie watched, remove its Radarr-managed file."
              checked={radarrChecked}
              disabled={updateSettings.isPending}
              pending={pendingIntegration === 'radarr'}
              onChange={(checked) => {
                setRadarrChecked(checked)
                setPendingIntegration('radarr')
                updateSettings.mutate(
                  { body: { deleteRadarrMovieFiles: checked } },
                  {
                    onError: () => setRadarrChecked(!checked),
                    onSettled: () => setPendingIntegration(null),
                  }
                )
              }}
            />
          </IntegrationCard>
        </div>
      </section>
    </div>
  )
}

function IntegrationCard({
  name,
  available,
  description,
  unavailableMessage,
  children,
}: {
  name: string
  available: boolean
  description: string
  unavailableMessage: string
  children: ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>{name}</CardTitle>
          <Badge variant={available ? 'secondary' : 'outline'}>
            {available ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
        <CardDescription>{available ? description : unavailableMessage}</CardDescription>
      </CardHeader>
      {available && <CardContent>{children}</CardContent>}
    </Card>
  )
}

function ProviderToggle({
  id,
  label,
  description,
  checked,
  disabled,
  pending,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  disabled: boolean
  pending: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Field orientation="horizontal" className="items-start gap-3">
      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
        {pending ? (
          <LoaderCircle className="size-4 animate-spin text-muted-foreground" aria-label="Saving" />
        ) : (
          <Checkbox id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
        )}
      </div>
      <FieldContent>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
    </Field>
  )
}
