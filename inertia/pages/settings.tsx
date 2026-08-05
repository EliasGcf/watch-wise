import { useMutation } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldLabel } from '~/components/ui/field'
import { api } from '~/client'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{
  integrations: {
    sonarr: { available: boolean; deleteEpisodeFiles: boolean }
    radarr: { available: boolean; deleteMovieFiles: boolean }
  }
}>

type PendingIntegration = 'sonarr' | 'radarr' | null

export default function Settings({ integrations }: Props) {
  const [sonarrChecked, setSonarrChecked] = useState(integrations.sonarr.deleteEpisodeFiles)
  const [radarrChecked, setRadarrChecked] = useState(integrations.radarr.deleteMovieFiles)
  const [pendingIntegration, setPendingIntegration] = useState<PendingIntegration>(null)

  const updateSettings = useMutation(
    api.api.user.settings.update.mutationOptions({
      onSuccess: () => toast.success('Settings saved.'),
      onError: () => toast.error('Settings could not be saved.'),
    })
  )

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Settings</p>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Provider actions for your library.
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Choose what Watch Wise should do through connected providers after you mark items as
          watched.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="Integrations">
        <IntegrationCard
          name="Sonarr"
          available={integrations.sonarr.available}
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
          available={integrations.radarr.available}
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
