import * as vscode from 'vscode'
import semver from 'semver'
import { getPackageJson } from './pkg'
import { getGlobalValue, setGlobalValue } from './storage'

export async function notifyUpdate(
  title: string,
  moduleName: string,
  storage: string,
  repo: string
) {
  // Grab version from last activation
  const prevVersion = getGlobalValue<string>(storage)

  // Grab current version
  const currentVersion = getPackageJson(moduleName).version

  // Update stored version for next activation
  setGlobalValue(storage, currentVersion)

  if (!prevVersion) {
    // No need to notify anything the first activation
    return
  }

  // Check if the version has been an updated and notify if so
  if (semver.gt(currentVersion, prevVersion)) {
    void vscode.window
      .showInformationMessage(
        `${title} has been updated to v${currentVersion}!`,
        `Learn More`
      )
      .then((didClick) => {
        if (didClick) {
          return vscode.env.openExternal(
            vscode.Uri.parse(
              `https://github.com/${repo}/releases/tag/${currentVersion}`
            )
          )
        }
      })
  }
}
