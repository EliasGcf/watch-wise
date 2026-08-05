import { type SonarrProviderManager } from '#providers/sonarr/manager'
import app from '@adonisjs/core/services/app'

export let sonarr!: SonarrProviderManager

await app.booted(async () => {
  sonarr = await app.container.make('sonarr_provider')
})
