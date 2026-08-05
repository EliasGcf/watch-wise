import { useMutation } from '@tanstack/react-query'
import { LoaderCircle } from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import { Checkbox } from '~/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '~/components/ui/field'
import { api } from '~/client'
import { type InertiaProps } from '~/types'

type Props = InertiaProps<{
  integrations: {
    sonarr: { available: boolean; deleteEpisodeFiles: boolean }
    radarr: { available: boolean; deleteMovieFiles: boolean }
  }
}>

export default function Settings({ integrations }: Props) {
  const [sonarrChecked, setSonarrChecked] = useState(integrations.sonarr.deleteEpisodeFiles)
  const [radarrChecked, setRadarrChecked] = useState(integrations.radarr.deleteMovieFiles)

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
          unavailableMessage="Sonarr is unavailable because no Sonarr provider is configured."
        >
          <ProviderToggle
            id="delete-sonarr-episode-files"
            label="Delete episode files after watching"
            description="When an episode is marked watched, Watch Wise asks Sonarr to delete the managed media file."
            checked={sonarrChecked}
            pending={updateSettings.isPending}
            onChange={(checked) => {
              setSonarrChecked(checked)
              updateSettings.mutate(
                { body: { deleteSonarrEpisodeFiles: checked } },
                { onError: () => setSonarrChecked(!checked) }
              )
            }}
          />
        </IntegrationCard>

        <IntegrationCard
          name="Radarr"
          available={integrations.radarr.available}
          unavailableMessage="Radarr is unavailable because no Radarr provider is configured."
        >
          <ProviderToggle
            id="delete-radarr-movie-files"
            label="Delete movie files after watching"
            description="When a movie is marked watched, Watch Wise asks Radarr to delete the managed media file."
            checked={radarrChecked}
            pending={updateSettings.isPending}
            onChange={(checked) => {
              setRadarrChecked(checked)
              updateSettings.mutate(
                { body: { deleteRadarrMovieFiles: checked } },
                { onError: () => setRadarrChecked(!checked) }
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
  unavailableMessage,
  children,
}: {
  name: string
  available: boolean
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
        <CardDescription>
          {available ? 'Provider actions are ready to use.' : unavailableMessage}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {available ? (
          children
        ) : (
          <p className="text-sm text-muted-foreground">{unavailableMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}

function ProviderToggle({
  id,
  label,
  description,
  checked,
  pending,
  onChange,
}: {
  id: string
  label: string
  description: string
  checked: boolean
  pending: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <Field orientation="horizontal">
      <Checkbox id={id} checked={checked} disabled={pending} onCheckedChange={onChange} />
      <div className="grid gap-1.5 leading-none">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
        {pending && (
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <LoaderCircle className="size-3 animate-spin" /> Saving...
          </span>
        )}
      </div>
    </Field>
  )
}
