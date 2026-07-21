import { hooks } from '@adonisjs/core/app'

const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`

export default hooks.devServerStarted((_, info, instructions) => {
  const host = info.host === '0.0.0.0' ? 'localhost' : info.host
  const baseUrl = `http://${host}:${info.port}`

  instructions.add(`APP: ${cyan(`${baseUrl}/app`)}`)
  instructions.add(`API: ${cyan(`${baseUrl}/api`)}`)
})
