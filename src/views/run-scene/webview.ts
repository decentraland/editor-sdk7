import path from 'path'
import vscode from 'vscode'
import { log } from '../../modules/log'
import { getExtensionPath } from '../../modules/path'
import { Webview } from '../../modules/webview'
import { ServerName } from '../../types'
import { getServerUrl } from '../../utils'

export async function createWebivew() {
  const panel = vscode.window.createWebviewPanel(
    `decentraland-sdk7.webviews.RunScene`,
    `Decentraland`,
    vscode.ViewColumn.Two,
    { enableScripts: true, retainContextWhenHidden: true }
  )

  panel.iconPath = vscode.Uri.file(
    path.join(getExtensionPath(), 'resources', 'logo.ico')
  )

  const url = await getServerUrl(ServerName.RunScene)

  // TODO: make more flexible the postMessage communication or define the types on @dcl/schemas
  // I skipped the type definition by hardly checking the message in `onMessage` function
  const webview = new Webview<never, never, any, any>(url, panel)

  webview.onMessage((message) => {
    if (
      typeof message.type === 'string' &&
      message.type.startsWith('logger.') &&
      message.payload &&
      Array.isArray(message.payload.args)
    ) {
      let text = message.payload.args[3]
      // messages of type logger.error for some reason come stringified, thus wrapped in extra double quotes
      if (message.type === 'logger.error') {
        try {
          const textAsJson = JSON.parse(text)
          if (textAsJson.message) text = textAsJson.message
        } catch (e) {
          // false alarm, proceed
        }
      }
      if (text) {
        log(`scene::${message.type.split('logger.').pop()} >`, text)
      }
    }
  })

  return webview
}
