import path from 'path'
import vscode from 'vscode'
import { log } from '../../modules/log'
import { getExtensionPath } from '../../modules/path'
import { Webview } from '../../modules/webview'
import { ServerName } from '../../types'
import { getServerUrl } from '../../utils'

export async function createWebview() {
  const panel = vscode.window.createWebviewPanel(
    `decentraland-sdk7.webviews.Inspector`,
    `Decentraland`,
    vscode.ViewColumn.One,
    { enableScripts: true, retainContextWhenHidden: true }
  )

  panel.iconPath = vscode.Uri.file(
    path.join(getExtensionPath(), 'resources', 'logo.ico')
  )

  const rpcUrl = (await getServerUrl(ServerName.InspectorRpc)).replace('http://', "ws://")
  const url = new URL(await getServerUrl(ServerName.Inspector))
  url.searchParams.set('rpc-ws', rpcUrl)

  const webview = new Webview(url.toString(), panel)

  log(`Inspector Web Url: ${url.toString()}`)

  return webview
}
