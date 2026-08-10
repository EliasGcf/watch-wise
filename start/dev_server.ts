import { hooks } from '@adonisjs/core/app'

const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`

export default hooks.devServerStarted((_, info, instructions) => {
  const baseUrl = process.env.PORTLESS_URL ?? process.env.APP_URL;
  instructions.add(`APP: ${cyan(`${baseUrl}/app`)}`)
  instructions.add(`API: ${cyan(`${baseUrl}/api`)}`)
})
