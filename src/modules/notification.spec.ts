import { MessageItem, window, env, Uri } from 'vscode'
import { notifyUpdate } from './notification'

/********************************************************
                          Mocks
*********************************************************/

import { getPackageJson } from './pkg'
jest.mock('./pkg')
const getPackageJsonMock = getPackageJson as jest.MockedFunction<
  typeof getPackageJson
>

import { getGlobalValue, setGlobalValue } from './storage'
jest.mock('./storage')
const getGlobalValueMock = getGlobalValue as jest.MockedFunction<
  typeof getGlobalValue
>
const setGlobalValueMock = setGlobalValue as jest.MockedFunction<
  typeof setGlobalValue
>

const showInformationMessageMock =
  window.showInformationMessage as jest.MockedFunction<
    typeof window.showInformationMessage
  >
const openExternalMock = env.openExternal as jest.MockedFunction<
  typeof env.openExternal
>
const uriParseMock = Uri.parse as jest.MockedFunction<typeof Uri.parse>

/********************************************************
                          Tests
*********************************************************/

describe('notification', () => {
  describe('When the current version is 2.0.0', () => {
    beforeEach(() => {
      getPackageJsonMock.mockReturnValueOnce({
        version: '2.0.0',
        // The node engine is only necessary for the return type of the helper, not relevant for this test
        engines: { node: '0.0.0-test' },
      })
    })
    afterEach(() => {
      getPackageJsonMock.mockReset()
      getGlobalValueMock.mockReset()
      setGlobalValueMock.mockReset()
      showInformationMessageMock.mockReset()
      openExternalMock.mockReset()
      uriParseMock.mockReset()
    })
    describe('there is no previous version (first activation)', () => {
      beforeEach(() => {
        // The first activation will return always an undefined stored value
        getGlobalValueMock.mockReturnValueOnce(undefined)
      })
      beforeEach(async () => {
        await notifyUpdate(
          'Test',
          'test-module',
          'testStorage',
          'test-org/test-repo'
        )
      })
      it('should read the current version from the package.json', () => {
        expect(getPackageJsonMock).toHaveBeenCalledWith('test-module')
      })
      it('should store the current version in global storage', () => {
        expect(setGlobalValueMock).toHaveBeenCalledWith('testStorage', '2.0.0')
      })
      it('should not show any notification to the user', () => {
        expect(showInformationMessageMock).not.toHaveBeenCalled()
      })
    })
    describe('and the previous version is older than the current version', () => {
      beforeEach(() => {
        getGlobalValueMock.mockReturnValueOnce('1.0.0')
        showInformationMessageMock.mockResolvedValueOnce(
          'Learn More' as unknown as MessageItem
        )
      })
      beforeEach(async () => {
        await notifyUpdate(
          'Test',
          'test-module',
          'testStorage',
          'test-org/test-repo'
        )
      })
      it('should show a notification to the user', () => {
        expect(showInformationMessageMock).toHaveBeenCalled()
      })
      it('should take the user to the changelog if they click on "Learn More"', () => {
        expect(openExternalMock).toHaveBeenCalled()
      })
      it('should point to the changelog of the current version', () => {
        expect(uriParseMock).toHaveBeenCalledWith(
          'https://github.com/test-org/test-repo/releases/tag/2.0.0'
        )
      })
    })
    describe('and the previous version is the same as the current version', () => {
      beforeEach(() => {
        getGlobalValueMock.mockReturnValueOnce('2.0.0')
      })
      beforeEach(async () => {
        await notifyUpdate(
          'Test',
          'test-module',
          'testStorage',
          'test-org/test-repo'
        )
      })
      it('should not show a notification to the user', () => {
        expect(showInformationMessageMock).not.toHaveBeenCalled()
      })
    })
  })
})
