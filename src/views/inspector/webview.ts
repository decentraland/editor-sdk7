import fetch from 'node-fetch'
import path from 'path'
import vscode from 'vscode'
import { getExtensionPath } from '../../modules/path'
import { waitForServer } from '../../modules/server'
import { ServerName } from '../../types'
import { getServerUrl } from '../../utils'
import { hasDependency } from '../../modules/pkg'
import { log } from '../../modules/log'
import { getProjectId, getUserId } from '../../modules/analytics'

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

  const dataLayerUrl = new URL(await getServerUrl(ServerName.RunScene))
  dataLayerUrl.pathname = '/data-layer'
  dataLayerUrl.search = ''
  dataLayerUrl.protocol = 'ws:'
  const dataLayerRpcWsUrl = dataLayerUrl.toString()

  const url = await getServerUrl(ServerName.Inspector)
  await waitForServer(url)

  const html = await fetch(url).then((res) => res.text())

  const hasAssetPacksInstalled = hasDependency('@dcl/asset-packs', true)

  log(
    hasAssetPacksInstalled
      ? '@dcl/asset-packs is installed'
      : '@dcl/asset-packs is not installed'
  )

  const config = {
    dataLayerRpcWsUrl: dataLayerRpcWsUrl,
    disableSmartItems: !hasAssetPacksInstalled,
    segmentKey: process.env.DCL_INSPECTOR_SDK7_SEGMENT_KEY,
    segmentAppId: 'editor',
    segmentUserId: getUserId(),
    projectId: getProjectId(),
  }

  panel.webview.html = html
    .replace('bundle.js', `${url}/bundle.js`)
    .replace('bundle.css', `${url}/bundle.css`)
    .replace(
      /(const config = ')(\$CONFIG)(')/gi,
      `$1${JSON.stringify(config)}$3`
    )
}
