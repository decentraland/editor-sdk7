import { ServerName } from '../types'
import { useCreatorHubMessage } from '../utils'

export async function browser(server: ServerName, params = '') {
  return useCreatorHubMessage()
}
