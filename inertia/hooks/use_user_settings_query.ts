import { useQuery } from '@tanstack/react-query'
import { api } from '~/client'

export function useUserSettingsQuery() {
  return useQuery(api.api.user.settings.show.queryOptions())
}
