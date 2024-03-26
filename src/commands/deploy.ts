import * as vscode from 'vscode'
import { loader } from '../modules/loader'
import { setLocalValue } from '../modules/storage'
import { getMessage } from '../modules/error'
import { createWebview } from '../views/publish-scene/webview'
import {
  getSceneLink,
  handleDeploymentError,
  validateSceneJson,
} from '../views/publish-scene/utils'
import { publishSceneServer } from '../views/publish-scene/server'
import { browser } from './browser'
import { ServerName } from '../types'
import { waitForServer } from '../modules/server'
import { getServerUrl } from '../utils'

export async function deploy(args: string = '', isWorld = false) {
  // Set world flag
  setLocalValue('isWorld', isWorld)

  // Make sure the scene json is correct
  validateSceneJson()

  // Start the server
  await publishSceneServer.start(...args.split(' '))
  const url = await getServerUrl(ServerName.PublishScene)
  await waitForServer(url)
  browser(ServerName.PublishScene)
  try {
    // Wait for user to publish
    const success = await publishSceneServer.waitForPublish()

    // If successful show jump in notification
    if (success) {
      const jumpIn = await vscode.window.showInformationMessage(
        'Scene published successfully!',
        'Jump In'
      )
      if (jumpIn) {
        vscode.env.openExternal(vscode.Uri.parse(getSceneLink(isWorld)))
      }
    }
    // Not successful is ignored, it means the process was killed gracefuly without getting to deploy, if an actual error ocurred it would throw and be handled by the catch block
  } catch (error) {
    // Something went wrong, kill server and show error
    await publishSceneServer.stop()
    handleDeploymentError(getMessage(error))
  }
}
