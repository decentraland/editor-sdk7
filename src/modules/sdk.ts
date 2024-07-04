import semver from 'semver'
import { log } from './log'
import { warnOutdatedSdkVersion } from './npm'
import { getPackageVersion } from './pkg'

export async function syncSdkVersion() {
  const extensionSdkVersion = getPackageVersion('@dcl/sdk')!
  const workspaceSdkVersion = getPackageVersion('@dcl/sdk', true)
  if (!workspaceSdkVersion) {
    // no need to sync if the workspace does not have a dependency on @dcl/sdk
    return
  }
  if (semver.lt(workspaceSdkVersion, extensionSdkVersion)) {
    log(`Extension @dcl/sdk version: ${extensionSdkVersion}`)
    log(`Workspace @dcl/sdk version: ${workspaceSdkVersion}`)
    log(`Workspace @dcl/sdk version is older than the extension\'s`)
    void warnOutdatedSdkVersion(extensionSdkVersion)
  }
  log(`Workspace @dcl/sdk version is up to date`)
}
