import { type RadarrProviderManager } from '#providers/radarr/manager'
import app from '@adonisjs/core/services/app'

export let radarr!: RadarrProviderManager

await app.booted(async () => {
  radarr = await app.container.make('radarr_provider')
})
