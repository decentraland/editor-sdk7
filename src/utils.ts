import { env, Uri } from 'vscode'
import { getPort } from './modules/port'
import { getLocalValue } from './modules/storage'
import { getScene } from './modules/workspace'
import { ServerName } from './types'

/**
 * Return the url for a given server
 * @param server The name of the server
 * @returns The url of that server
 */
export async function getServerUrl(server: ServerName) {
  const hasLocalServer = process.env.LOCAL_DEV_SERVER === server
  const port = hasLocalServer
    ? Number(process.env.LOCAL_DEV_PORT || 3000)
    : await getPort(server)
  const url = await env.asExternalUri(Uri.parse(`http://localhost:${port}`))
  return url.toString() + getServerParams(server)
}

/**
 * Return the params for a given server
 * @param server The name of the server
 * @returns The url of that server
 */

export function getServerParams(server: ServerName) {
  // TODO: Remove this when the explorer fixes the new backpack for the preview
  const oldBackpack = '&DISABLE_backpack_editor_v2=&ENABLE_backpack_editor_v1'
  switch (server) {
    case ServerName.RunScene:
      return `?position=${encodeURI(getScene().scene.base)}&PIPE_SCENE_CONSOLE${oldBackpack}`
    case ServerName.PublishScene:
      return getLocalValue<boolean>('isWorld') ? `?skipValidations=true` : ''
    default:
      return ''
  }
}

const WIN = process.platform === 'win32'
const WIN_DRIVE = WIN ? require('path').resolve('/').substring(0, 2) : ''

/**
 * Convert regular slash to invert slash, only if it's running in win32 platform
 * @param str string to convert
 * @returns Converted string
 */
export function convertSlashToInvertSlashIfWin32(str: string) {
  return WIN ? str.replace(/\//g, '\\') : str
}

/**
 * Add the default unit drive when it's running in win32 platform
 * @param str string to convert
 * @returns Converted string
 */
export function addDriveIfWin32(str: string) {
  return WIN_DRIVE + str
}