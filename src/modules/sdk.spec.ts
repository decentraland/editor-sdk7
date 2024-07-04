import { syncSdkVersion } from './sdk'

/********************************************************
                          Mocks
*********************************************************/

import { warnOutdatedSdkVersion } from './npm'
jest.mock('./npm')
const warnOutdatedSdkVersionMock =
  warnOutdatedSdkVersion as jest.MockedFunction<typeof warnOutdatedSdkVersion>

import { getPackageVersion } from './pkg'
jest.mock('./pkg')
const getPackageVersionMock = getPackageVersion as jest.MockedFunction<
  typeof getPackageVersion
>

/********************************************************
                          Tests
*********************************************************/

let extensionSdkVersion: string = '1.0.0'
let workspaceSdkVersion: string | null = '1.0.0'

describe('sdk', () => {
  beforeEach(() => {
    getPackageVersionMock.mockImplementation((_path, workspace) =>
      workspace ? workspaceSdkVersion : extensionSdkVersion
    )
  })
  afterEach(() => {
    getPackageVersionMock.mockReset()
  })
  describe('When syncing the @dcl/sdk version', () => {
    describe('and the workspace does not use @dcl/sdk', () => {
      beforeEach(() => {
        extensionSdkVersion = '1.0.0'
        workspaceSdkVersion = null
      })
      it('should not install the sdk', async () => {
        await syncSdkVersion()
        expect(warnOutdatedSdkVersionMock).not.toHaveBeenCalled()
      })
    })
    describe("and the version of the workspace's @dcl/sdk is the same than the one on the extension", () => {
      beforeEach(() => {
        extensionSdkVersion = '1.0.0'
        workspaceSdkVersion = extensionSdkVersion
      })
      it('should not install the sdk', async () => {
        await syncSdkVersion()
        expect(warnOutdatedSdkVersionMock).not.toHaveBeenCalled()
      })
    })
    describe("and the version of the workspace's @dcl/sdk is different to the one on the extension", () => {
      beforeEach(() => {
        extensionSdkVersion = '2.0.0'
        workspaceSdkVersion = '1.0.0'
      })
      it('should install the extension version into the workspace', async () => {
        await syncSdkVersion()
        expect(warnOutdatedSdkVersionMock).toHaveBeenCalledWith('2.0.0')
      })
    })
  })
})
