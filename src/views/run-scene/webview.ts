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
    if (typeof message.type === "string" && message.type.startsWith("logger.") && message.payload && Array.isArray(message.payload.args)) {
      log(message.type, ...message.payload.args)
    }
  })

  return webview
}
