import path from 'path'
import { StaticServer } from '../../modules/server'
import { ServerName } from '../../types'
import { getCwd } from '../../modules/workspace'

export const inspectorServer = new StaticServer(ServerName.Inspector, () =>
  path.join(getCwd(), './node_modules/@dcl/inspector/public')
)
