import path from 'path'
import { StaticServer } from '../../modules/server'
import { ServerName } from '../../types'
import { getCwd } from '../../modules/workspace'
import { log } from '../../modules/log'

export const inspectorServer = new StaticServer(ServerName.Inspector, () => {
  const inspectorPath = path.dirname(
    require.resolve('@dcl/inspector/package.json', { paths: [getCwd()] })
  )
  log('Serving inspector from:', inspectorPath)
  return path.join(inspectorPath, './public')
})
