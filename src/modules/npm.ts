import * as vscode from 'vscode'
import future from 'fp-future'
import { loader } from './loader'
import { bin } from './bin'
import { restart } from '../commands/restart'
import { runSceneServer } from '../views/run-scene/server'
import {
  getGlobalValue,
  getLocalValue,
  setGlobalValue,
  setLocalValue,
} from './storage'
import { track } from './analytics'
import { getMessage } from './error'
import { getExtensionPath, getNodeModulesCachePath } from './path'
import { getPackageVersion } from './pkg'
import { log } from './log'
import { exists } from './fs'

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
        `Updating Decentraland Editor v${version} [2/3]: Installing...`,
        async () => {
          track(`npm.install_extension`, { dependency: null })
          const child = bin('npm', 'npm', ['install'], {
            cwd: getExtensionPath(),
          })

          // Look for errors
          const errorFuture = future()
          child.once(/npm ERR!/, (error) =>
            errorFuture.reject(new Error(error))
          )

          return Promise.race([child.wait(), errorFuture])
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

/**
 * Cleans the extension's npm cache
 */
export async function cleanExtension() {
  log(`Cleaning npm cache...`)
  await loader(
    `Cleaning cache...`,
    async () => {
      track(`npm.clean_extension`, { dependency: null })
      await bin('npm', 'npm', ['cache', 'clean', '--force'], {
        cwd: getExtensionPath(),
      }).wait()
    },
    vscode.ProgressLocation.Notification
  )
}

/**
 * Caches the extension's dependencies
 */
export async function cacheDependencies() {
  const version = getPackageVersion()
  const key = `extension-cache:${version}`
  const isCached = await getGlobalValue(key)
  if (isCached) return
  const nodeModulesCachePath = getNodeModulesCachePath()
  log(`Updating cache into ${nodeModulesCachePath}`)
  await loader(
    `Updating Decentraland Editor v${version} [3/3]: Saving cache...`,
    async () => {
      track(`npm.cache_node_modules`, { dependency: null })
      await vscode.workspace.fs.copy(
        vscode.Uri.joinPath(
          vscode.Uri.parse(getExtensionPath()),
          'node_modules'
        ),
        vscode.Uri.parse(nodeModulesCachePath),
        { overwrite: true }
      )
    },
    vscode.ProgressLocation.Notification
  )
  setGlobalValue(key, true)
}

/**
 * Restore the extension's dependencies from cache
 */
export async function restoreDependencies() {
  const nodeModulesCachePath = getNodeModulesCachePath()
  const nodeModulesCacheExists = await exists(nodeModulesCachePath)
  if (!nodeModulesCacheExists) return
  const version = getPackageVersion()
  const key = `extension:${version}`
  const isInstalled = await getGlobalValue(key)
  if (isInstalled) return
  log(`Restoring cache...`)
  await loader(
    `Updating Decentraland Editor v${version} [1/3]: Restoring cache...`,
    async () => {
      track(`npm.restore_node_modules`, { dependency: null })
      await vscode.workspace.fs.copy(
        vscode.Uri.parse(nodeModulesCachePath),
        vscode.Uri.joinPath(
          vscode.Uri.parse(getExtensionPath()),
          'node_modules'
        ),
        { overwrite: true }
      )
    },
    vscode.ProgressLocation.Notification
  )
}

/**
 * Warns the user that a dependency is outdated, allows them to upgrade it
 * @param version
 * @returns
 */
export async function warnOutdatedSdkVersion(version: string) {
  const storageKey = `ignore-sdk-version:${version}`
  const isIgnored = getLocalValue<boolean>(storageKey)
  if (isIgnored) {
    return
  }
  const update = 'Update'
  const ignore = 'Ignore'
  track(`npm.warn_outdated_sdk:show`)
  const action = await vscode.window.showInformationMessage(
    `New version available: Decentraland SDK v${version}`,
    update,
    ignore
  )
  if (action === update) {
    await npmInstall(`@dcl/sdk@${version}`)
    track(`npm.warn_outdated_sdk:update`)
  } else if (action === ignore) {
    setLocalValue(storageKey, true)
    track(`npm.warn_outdated_sdk:ignore`)
  }
}
