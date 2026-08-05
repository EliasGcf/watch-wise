import { type SonarrProviderManager } from '#providers/sonarr/manager'
import type { SonarrProviderConfig } from '#providers/sonarr/types'
import app from '@adonisjs/core/services/app'

export let sonarr!: SonarrProviderManager

await app.booted(async () => {
  sonarr = await app.container.make('sonarr_provider')
})

export function isSonarrAvailable() {
  return Boolean(app.config.get<SonarrProviderConfig>('sonarr_provider').default)
}
