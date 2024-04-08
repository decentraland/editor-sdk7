import * as vscode from 'vscode'
import { loader } from './loader'
import { bin } from './bin'
import { restart } from '../commands/restart'
import { runSceneServer } from '../views/run-scene/server'
import { getGlobalValue, setGlobalValue } from './storage'
import { track } from './analytics'
import { getMessage } from './error'
import { getExtensionPath } from './path'
import { getPackageVersion } from './pkg'
import { log } from './log'

/**
 * Installs a list of npm packages, or install all dependencies if no list is provided
 * @param dependencies List of npm packages
 * @returns Promise that resolves when the install finishes
 */
export async function npmInstall(dependency?: string) {
  try {
    return await loader(
      dependency ? `Installing ${dependency}...` : `Installing dependencies...`,
      async () => {
        await runSceneServer.stop()
        track(`npm.install`, { dependency: dependency || null })
        await bin('npm', 'npm', ['install', dependency]).wait()
        await restart() // restart server after installing packages
      },
      dependency
        ? vscode.ProgressLocation.Window
        : vscode.ProgressLocation.Notification
    )
  } catch (error) {
    throw new Error(
      `Error installing ${dependency || 'dependencies'}: ${getMessage(error)}`
    )
  }
}

/**
 * Uninstalls a list of npm packages
 * @param dependencies List of npm packages
 * @returns Promise that resolves when the uninstall finishes
 */
export async function npmUninstall(dependency: string) {
  return loader(`Uninstalling ${dependency}...`, async () => {
    await runSceneServer.stop()
    track(`npm.uninstall`, { dependency })
    await bin('npm', 'npm', ['uninstall', dependency]).wait()
    await restart() // restart server after uninstalling packages
  })
}

/**
 * Installs the extension dependencies
 * @returns Promise that resolves when the install finishes
 */
export async function installExtension() {
  try {
    const version = getPackageVersion()
    const key = `extension:${version}`
    const isInstalled = await getGlobalValue(key)
    if (!isInstalled) {
      log(`Installing extension v${version}...`)
      await loader(
        `Updating Decentraland Editor v${version}...`,
        async () => {
          track(`npm.install_extension`, { dependency: null })
          await bin('npm', 'npm', ['install'], {
            cwd: getExtensionPath(),
          }).wait()
        },
        vscode.ProgressLocation.Notification
      )
      setGlobalValue(key, true)
    } else {
      log(`Extension v${version} already installed!`)
    }
  } catch (error) {
    throw new Error(`Error installing extension: ${getMessage(error)}`)
  }
}
