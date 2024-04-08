import { ProgressLocation, window } from 'vscode'
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

import { getExtensionPath } from './path'
jest.mock('./path')
const getExtensionPathMock = getExtensionPath as jest.MockedFunction<
  typeof getExtensionPath
>

import { getPackageVersion } from './pkg'
jest.mock('./pkg')
const getPackageVersionMock = getPackageVersion as jest.MockedFunction<
  typeof getPackageVersion
>

import { track } from './analytics'
import { installExtension, npmInstall, npmUninstall } from './npm'
jest.mock('./analytics')
const trackMock = track as jest.MockedFunction<typeof track>

let child: SpanwedChild

/********************************************************
                          Tests
*********************************************************/

describe('npm', () => {
  beforeEach(() => {
    child = {
      wait: jest.fn().mockResolvedValue(void 0),
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
          'Updating Decentraland Editor v1.0.0...',
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
    describe('and the installation succeeds', () => {
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
  })
})
