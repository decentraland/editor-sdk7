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

  const webview = new Webview(url, panel)

  webview.onMessage((message) => {
    if (message.type === "log" || message.type === "error") {
      const args = message.payload as any[]
      if (typeof args[0] === 'string' && args[0].startsWith('kernel:scene')) {
        log(...args)
      }
    }
  })

  return webview
}
