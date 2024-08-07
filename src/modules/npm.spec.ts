import { ProgressLocation, workspace, window, MessageItem } from 'vscode'
import { SpanwedChild } from './spawn'

/********************************************************
                          Mocks
*********************************************************/

import { loader } from './loader'
jest.mock('./loader')
const loaderMock = loader as jest.MockedFunction<typeof loader>

import { bin } from './bin'
jest.mock('./bin')
const binMock = bin as jest.MockedFunction<typeof bin>

import { restart } from '../commands/restart'
jest.mock('../commands/restart')
const restartMock = restart as jest.MockedFunction<typeof restart>

import { runSceneServer } from '../views/run-scene/server'
jest.spyOn(runSceneServer, 'stop')
const stopServerMock = runSceneServer.stop as jest.MockedFunction<
  typeof runSceneServer.stop
>

import { getGlobalValue, setGlobalValue } from './storage'
jest.mock('./storage')
const getGlobalValueMock = getGlobalValue as jest.MockedFunction<
  typeof getGlobalValue
>
const setGlobalValueMock = setGlobalValue as jest.MockedFunction<
  typeof setGlobalValue
>

import {
  getExtensionPath,
  getGlobalStoragePath,
  getNodeModulesCachePath,
} from './path'
jest.mock('./path')
const getExtensionPathMock = getExtensionPath as jest.MockedFunction<
  typeof getExtensionPath
>
const getGlobalStoragePathMock = getGlobalStoragePath as jest.MockedFunction<
  typeof getGlobalStoragePath
>
const getNodeModulesCachePathMock =
  getNodeModulesCachePath as jest.MockedFunction<typeof getNodeModulesCachePath>

import { getPackageVersion } from './pkg'
jest.mock('./pkg')
const getPackageVersionMock = getPackageVersion as jest.MockedFunction<
  typeof getPackageVersion
>

import { track } from './analytics'
jest.mock('./analytics')
const trackMock = track as jest.MockedFunction<typeof track>

import { exists } from './fs'
jest.mock('./fs')
const existsMock = exists as jest.MockedFunction<typeof exists>

import { getLocalValue, setLocalValue } from './storage'
jest.mock('./storage')
const getLocalValueMock = getLocalValue as jest.MockedFunction<
  typeof getLocalValue
>
const setLocalValueMock = setLocalValue as jest.MockedFunction<
  typeof setLocalValue
>

import {
  cacheDependencies,
  restoreDependencies,
  cleanExtension,
  installExtension,
  npmInstall,
  npmUninstall,
  warnOutdatedSdkVersion,
} from './npm'

const copyMock = workspace.fs.copy as jest.MockedFunction<
  typeof workspace.fs.copy
>

const showInformationMessageMock =
  window.showInformationMessage as jest.MockedFunction<
    typeof window.showInformationMessage
  >

let child: SpanwedChild

/********************************************************
                          Tests
*********************************************************/

describe('npm', () => {
  beforeEach(() => {
    child = {
      wait: jest.fn().mockResolvedValue(void 0),
      once: jest.fn(),
    } as unknown as SpanwedChild
    stopServerMock.mockResolvedValue()
    binMock.mockReturnValue(child)
    restartMock.mockResolvedValue()
  })
  afterEach(() => {
    stopServerMock.mockReset()
    binMock.mockReset()
    restartMock.mockReset()
  })
  describe('When installing dependencies', () => {
    describe('and the installation succeeds', () => {
      beforeEach(() => {
        loaderMock.mockImplementationOnce(
          (_title, waitFor) => waitFor({} as any) as Promise<void>
        )
      })
      afterEach(() => {
        loaderMock.mockReset()
      })
      it('should stop the server', async () => {
        await npmInstall()
        expect(stopServerMock).toHaveBeenCalled()
      })
      it('should use npm to install the dependencies', async () => {
        await npmInstall()
        expect(binMock).toHaveBeenCalledWith('npm', 'npm', ['install'])
      })
      it('should wait for the npm child process to finish', async () => {
        await npmInstall()
        expect(child.wait).toHaveBeenCalled()
      })
      it('should restart the preview', async () => {
        await npmInstall()
        expect(restartMock).toHaveBeenCalled()
      })
      it('should show a notification', async () => {
        await npmInstall()
        expect(loaderMock).toHaveBeenCalledWith(
          'Installing dependencies...',
          expect.any(Function),
          ProgressLocation.Notification
        )
      })
      it('should track the npm.install event', async () => {
        await npmInstall()
        expect(trackMock).toHaveBeenCalledWith('npm.install', {
          dependency: null,
        })
      })
      describe('and only one dependency is being installed', () => {
        it('should pass that dependency as a parameter to npm', async () => {
          await npmInstall('the-dependency')
          expect(binMock).toHaveBeenCalledWith('npm', 'npm', [
            'install',
            'the-dependency',
          ])
        })
        it('should show a loader in the status bar', async () => {
          await npmInstall('the-dependency')
          expect(loaderMock).toHaveBeenCalledWith(
            'Installing the-dependency...',
            expect.any(Function),
            ProgressLocation.Window
          )
        })
      })
    })
    describe('and the installation fails', () => {
      beforeEach(() => {
        loaderMock.mockRejectedValueOnce(new Error('Some error'))
      })
      afterEach(() => {
        loaderMock.mockReset()
      })
      it('should throw an error', async () => {
        await expect(npmInstall()).rejects.toThrow('Some error')
      })
    })
  })
  describe('When uninstalling a dependency', () => {
    describe('and the uninstallation succeeds', () => {
      beforeEach(() => {
        loaderMock.mockImplementationOnce(
          (_title, waitFor) => waitFor({} as any) as Promise<void>
        )
      })
      afterEach(() => {
        loaderMock.mockReset()
      })
      it('should stop the server', async () => {
        await npmUninstall('the-dependency')
        expect(stopServerMock).toHaveBeenCalled()
      })
      it('should use npm to uninstall the dependencies', async () => {
        await npmUninstall('the-dependency')
        expect(binMock).toHaveBeenCalledWith('npm', 'npm', [
          'uninstall',
          'the-dependency',
        ])
      })
      it('should wait for the npm child process to finish', async () => {
        await npmUninstall('the-dependency')
        expect(child.wait).toHaveBeenCalled()
      })
      it('should restart the preview', async () => {
        await npmUninstall('the-dependency')
        expect(restartMock).toHaveBeenCalled()
      })
      it('should show a loader in the status bar', async () => {
        await npmUninstall('the-dependency')
        expect(loaderMock).toHaveBeenCalledWith(
          'Uninstalling the-dependency...',
          expect.any(Function)
        )
      })
      it('should track the npm.uninstall event', async () => {
        await npmUninstall('the-dependency')
        expect(trackMock).toHaveBeenCalledWith('npm.uninstall', {
          dependency: 'the-dependency',
        })
      })
    })
    describe('and the uninstallation fails', () => {
      beforeEach(() => {
        loaderMock.mockRejectedValueOnce(new Error('Some error'))
      })
      afterEach(() => {
        loaderMock.mockReset()
      })
      it('should throw an error', async () => {
        await expect(npmUninstall('the-dependency')).rejects.toThrow(
          'Some error'
        )
      })
    })
  })
  describe('When installing the extension', () => {
    describe('and the installation succeeds', () => {
      beforeEach(() => {
        loaderMock.mockImplementationOnce(
          (_title, waitFor) => waitFor({} as any) as Promise<void>
        )
        getExtensionPathMock.mockReturnValueOnce('/path/to/extension')
        getPackageVersionMock.mockReturnValueOnce('1.0.0')
        getGlobalValueMock.mockReturnValueOnce(void 0)
      })
      afterEach(() => {
        loaderMock.mockReset()
        getExtensionPathMock.mockReset()
        getPackageVersionMock.mockReset()
        getGlobalValueMock.mockReset()
        setGlobalValueMock.mockReset()
      })
      it('should use npm to install the dependencies', async () => {
        await installExtension()
        expect(binMock).toHaveBeenCalledWith('npm', 'npm', ['install'], {
          cwd: '/path/to/extension',
        })
      })
      it('should wait for the npm child process to finish', async () => {
        await installExtension()
        expect(child.wait).toHaveBeenCalled()
      })
      it('check if the extension was already installed', async () => {
        await installExtension()
        expect(getGlobalValueMock).toHaveBeenCalledWith('extension:1.0.0')
      })
      it('should show a loader on the status bar', async () => {
        await installExtension()
        expect(loaderMock).toHaveBeenCalledWith(
          'Updating Decentraland Editor v1.0.0 [2/3]: Installing...',
          expect.any(Function),
          ProgressLocation.Notification
        )
      })
      it('should track the npm.install_extension event', async () => {
        await installExtension()
        expect(trackMock).toHaveBeenCalledWith('npm.install_extension', {
          dependency: null,
        })
      })
      it('should store the extension version installed', async () => {
        await installExtension()
        expect(setGlobalValueMock).toHaveBeenCalledWith('extension:1.0.0', true)
      })
    })
    describe('and the extension was already installed', () => {
      beforeEach(() => {
        getPackageVersionMock.mockReturnValueOnce('1.0.0')
        getGlobalValueMock.mockReturnValueOnce(true)
      })
      afterEach(() => {
        getPackageVersionMock.mockReset()
        getGlobalValueMock.mockReset()
      })
      it('should skip the installation', async () => {
        await installExtension()
        expect(binMock).not.toHaveBeenCalled()
      })
    })
    describe('and the installation fails', () => {
      beforeEach(() => {
        loaderMock.mockRejectedValueOnce(new Error('Some error'))
      })
      afterEach(() => {
        loaderMock.mockReset()
      })
      it('should throw an error', async () => {
        await expect(installExtension()).rejects.toThrow('Some error')
      })
    })
    describe('and there is an npm error', () => {
      beforeEach(() => {
        const onceMock = child.once as jest.Mock
        const waitMock = child.wait as jest.Mock
        onceMock.mockImplementation((_pattern, handler) => {
          handler('npm ERR! Some error')
        })
        waitMock.mockImplementation(() => new Promise(() => void 0))
        loaderMock.mockImplementationOnce(
          (_title, waitFor) => waitFor({} as any) as Promise<void>
        )
      })
      afterEach(() => {
        const onceMock = child.once as jest.Mock
        const waitMock = child.wait as jest.Mock
        onceMock.mockReset()
        waitMock.mockReset()
        loaderMock.mockReset()
      })
      it('should throw an error', async () => {
        await expect(installExtension()).rejects.toThrow('npm ERR! Some error')
      })
    })
  })
  describe('When cleaning the extension cache', () => {
    describe('and the cache clean succeeds', () => {
      beforeEach(() => {
        loaderMock.mockImplementationOnce(
          (_title, waitFor) => waitFor({} as any) as Promise<void>
        )
        getExtensionPathMock.mockReturnValueOnce('/path/to/extension')
      })
      afterEach(() => {
        loaderMock.mockReset()
        getExtensionPathMock.mockReset()
      })
      it('should use npm to clean the cache', async () => {
        await cleanExtension()
        expect(binMock).toHaveBeenCalledWith(
          'npm',
          'npm',
          ['cache', 'clean', '--force'],
          {
            cwd: '/path/to/extension',
          }
        )
      })
      it('should wait for the npm child process to finish', async () => {
        await cleanExtension()
        expect(child.wait).toHaveBeenCalled()
      })
      it('should show a loader', async () => {
        await cleanExtension()
        expect(loaderMock).toHaveBeenCalledWith(
          'Cleaning cache...',
          expect.any(Function),
          ProgressLocation.Notification
        )
      })
      it('should track the npm.install_extension event', async () => {
        await cleanExtension()
        expect(trackMock).toHaveBeenCalledWith('npm.clean_extension', {
          dependency: null,
        })
      })
    })
    describe('and the installation fails', () => {
      beforeEach(() => {
        loaderMock.mockRejectedValueOnce(new Error('Some error'))
      })
      afterEach(() => {
        loaderMock.mockReset()
      })
      it('should throw an error', async () => {
        await expect(cleanExtension()).rejects.toThrow('Some error')
      })
    })
  })
  describe("When caching the extension's node_modules", () => {
    describe('and the caching succeeds', () => {
      beforeEach(() => {
        loaderMock.mockImplementationOnce(
          (_title, waitFor) => waitFor({} as any) as Promise<void>
        )
        getExtensionPathMock.mockReturnValueOnce('/path/to/extension')
        getGlobalStoragePathMock.mockReturnValueOnce('/globalStorage')
        getPackageVersionMock.mockReturnValueOnce('1.0.0')
        getGlobalValueMock.mockReturnValueOnce(void 0)
        copyMock.mockResolvedValue()
        getNodeModulesCachePathMock.mockReturnValueOnce(
          '/globalStorage/.cache/node_modules'
        )
      })
      afterEach(() => {
        loaderMock.mockReset()
        getExtensionPathMock.mockReset()
        getGlobalStoragePathMock.mockReset()
        getPackageVersionMock.mockReset()
        getGlobalValueMock.mockReset()
        setGlobalValueMock.mockReset()
        copyMock.mockReset()
        getNodeModulesCachePathMock.mockReset()
      })
      it("should copy the extension's node_modules into the global node_modules cache", async () => {
        await cacheDependencies()
        expect(copyMock).toHaveBeenCalled()
      })
      it('check if the extension was already cached', async () => {
        await cacheDependencies()
        expect(getGlobalValueMock).toHaveBeenCalledWith('extension-cache:1.0.0')
      })
      it('should show a loader', async () => {
        await cacheDependencies()
        expect(loaderMock).toHaveBeenCalledWith(
          'Updating Decentraland Editor v1.0.0 [3/3]: Saving cache...',
          expect.any(Function),
          ProgressLocation.Notification
        )
      })
      it('should track the npm.cache_node_modules event', async () => {
        await cacheDependencies()
        expect(trackMock).toHaveBeenCalledWith('npm.cache_node_modules', {
          dependency: null,
        })
      })
      it('should store the extension version installed', async () => {
        await cacheDependencies()
        expect(setGlobalValueMock).toHaveBeenCalledWith(
          'extension-cache:1.0.0',
          true
        )
      })
    })
    describe('and the extension was already cached', () => {
      beforeEach(() => {
        getPackageVersionMock.mockReturnValueOnce('1.0.0')
        getGlobalValueMock.mockReturnValueOnce(true)
      })
      afterEach(() => {
        getPackageVersionMock.mockReset()
        getGlobalValueMock.mockReset()
      })
      it('should skip the caching', async () => {
        await cacheDependencies()
        expect(copyMock).not.toHaveBeenCalled()
      })
    })
  })
  describe("When restoring the extension's node_modules cache", () => {
    describe('and the restoring succeeds', () => {
      beforeEach(() => {
        loaderMock.mockImplementationOnce(
          (_title, waitFor) => waitFor({} as any) as Promise<void>
        )
        getExtensionPathMock.mockReturnValueOnce('/path/to/extension')
        getGlobalStoragePathMock.mockReturnValueOnce('/globalStorage')
        getPackageVersionMock.mockReturnValueOnce('1.0.0')
        getGlobalValueMock.mockReturnValueOnce(void 0)
        copyMock.mockResolvedValue()
        existsMock.mockResolvedValue(true)
        getNodeModulesCachePathMock.mockReturnValueOnce(
          '/globalStorage/.cache/node_modules'
        )
      })
      afterEach(() => {
        loaderMock.mockReset()
        getExtensionPathMock.mockReset()
        getGlobalStoragePathMock.mockReset()
        getPackageVersionMock.mockReset()
        getGlobalValueMock.mockReset()
        setGlobalValueMock.mockReset()
        copyMock.mockReset()
        existsMock.mockReset()
        getNodeModulesCachePathMock.mockReset()
      })
      it("should copy the global node_modules cache into the extension's node_modules", async () => {
        await restoreDependencies()
        expect(copyMock).toHaveBeenCalled()
      })
      it('check if the cache exists', async () => {
        await restoreDependencies()
        expect(existsMock).toHaveBeenCalledWith(
          '/globalStorage/.cache/node_modules'
        )
      })
      it('check if the extension was already installed', async () => {
        await restoreDependencies()
        expect(getGlobalValueMock).toHaveBeenCalledWith('extension:1.0.0')
      })
      it('should show a loader', async () => {
        await restoreDependencies()
        expect(loaderMock).toHaveBeenCalledWith(
          'Updating Decentraland Editor v1.0.0 [1/3]: Restoring cache...',
          expect.any(Function),
          ProgressLocation.Notification
        )
      })
      it('should track the npm.restore_node_modules event', async () => {
        await restoreDependencies()
        expect(trackMock).toHaveBeenCalledWith('npm.restore_node_modules', {
          dependency: null,
        })
      })
    })
    describe('and the extension was already installed', () => {
      beforeEach(() => {
        getPackageVersionMock.mockReturnValueOnce('1.0.0')
        getGlobalValueMock.mockReturnValueOnce(true)
        existsMock.mockResolvedValue(true)
        getNodeModulesCachePathMock.mockReturnValueOnce(
          '/globalStorage/.cache/node_modules'
        )
      })
      afterEach(() => {
        getPackageVersionMock.mockReset()
        getGlobalValueMock.mockReset()
        existsMock.mockReset()
        getNodeModulesCachePathMock.mockReset()
      })
      it('should skip the caching', async () => {
        await restoreDependencies()
        expect(copyMock).not.toHaveBeenCalled()
      })
    })
    describe('and the cache does not exist', () => {
      beforeEach(() => {
        getPackageVersionMock.mockReturnValueOnce('1.0.0')
        getGlobalValueMock.mockReturnValueOnce(true)
        existsMock.mockResolvedValue(false)
        getNodeModulesCachePathMock.mockReturnValueOnce(
          '/globalStorage/.cache/node_modules'
        )
      })
      afterEach(() => {
        getPackageVersionMock.mockReset()
        getGlobalValueMock.mockReset()
        existsMock.mockReset()
        getNodeModulesCachePathMock.mockReset()
      })
      it('should skip the caching', async () => {
        await restoreDependencies()
        expect(copyMock).not.toHaveBeenCalled()
      })
    })
  })
  describe('When warning that the SDK is outdated', () => {
    beforeEach(() => {
      loaderMock.mockImplementationOnce(
        (_title, waitFor) => waitFor({} as any) as Promise<void>
      )
    })
    afterEach(() => {
      loaderMock.mockReset()
    })
    describe('and the messagge has been ignored', () => {
      beforeEach(() => {
        getLocalValueMock.mockReturnValueOnce(true)
      })
      afterEach(() => {
        getLocalValueMock.mockReset()
      })
      it('should not promp the user', async () => {
        await warnOutdatedSdkVersion('1.0.0')
        expect(showInformationMessageMock).not.toHaveBeenCalled()
      })
    })
    describe('and the messagge has not been ignored', () => {
      beforeEach(() => {
        getLocalValueMock.mockReturnValueOnce(false)
      })
      afterEach(() => {
        getLocalValueMock.mockReset()
      })
      describe('and the user selects to update the SDK', () => {
        beforeEach(() => {
          showInformationMessageMock.mockResolvedValueOnce(
            'Update' as unknown as MessageItem
          )
          loaderMock.mockResolvedValueOnce(void 0)
        })
        afterEach(() => {
          showInformationMessageMock.mockReset()
          loaderMock.mockReset()
        })
        it('should track the show event', async () => {
          await warnOutdatedSdkVersion('1.0.0')
          expect(trackMock).toHaveBeenCalledWith('npm.warn_outdated_sdk:show')
        })
        it('should promp the user', async () => {
          await warnOutdatedSdkVersion('1.0.0')
          expect(showInformationMessageMock).toHaveBeenCalledWith(
            `New version available: Decentraland SDK v1.0.0`,
            'Update',
            'Ignore'
          )
        })
        it('should install the latest version of the dependency using npm', async () => {
          await warnOutdatedSdkVersion('1.0.0')
          expect(binMock).toHaveBeenCalledWith('npm', 'npm', [
            'install',
            '@dcl/sdk@1.0.0',
          ])
        })
        it('track the update event', async () => {
          await warnOutdatedSdkVersion('1.0.0')
          expect(trackMock).toHaveBeenCalledWith('npm.warn_outdated_sdk:update')
        })
      })
      describe('and the user ignores the warning', () => {
        beforeEach(() => {
          showInformationMessageMock.mockResolvedValueOnce(
            'Ignore' as unknown as MessageItem
          )
          setLocalValueMock.mockReturnValueOnce(void 0)
        })
        afterEach(() => {
          showInformationMessageMock.mockReset()
          setLocalValueMock.mockReset()
        })
        it('should store the ignore flag in the local storage', async () => {
          await warnOutdatedSdkVersion('1.0.0')
          expect(setLocalValueMock).toHaveBeenCalledWith(
            'ignore-sdk-version:1.0.0',
            true
          )
        })
        it('should track the ignore event', async () => {
          await warnOutdatedSdkVersion('1.0.0')
          expect(trackMock).toHaveBeenCalledWith('npm.warn_outdated_sdk:ignore')
        })
      })
    })
  })
})
