import fetch from 'node-fetch'
import path from 'path'
import vscode from 'vscode'
import { getExtensionPath } from '../../modules/path'
import { waitForServer } from '../../modules/server'
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

  const url = await getServerUrl(ServerName.Inspector)
  await waitForServer(url)
  const html = await fetch(url).then((res) => res.text())
  panel.webview.html = html
    .replace('bundle.js', `${url}/bundle.js`)
    .replace('bundle.css', `${url}/bundle.css`)
}
