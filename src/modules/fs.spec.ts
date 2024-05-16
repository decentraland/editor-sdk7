import { workspace } from 'vscode'
import { exists } from './fs'

describe('fs', () => {
  describe('When checking if a path exists', () => {
    it('should return true if the path exists', async () => {
      const result = await exists('/path/to/file')
      expect(result).toBe(true)
    })
    it('should return false if the path does not exist', async () => {
      debugger
      const statMock = workspace.fs.stat as jest.MockedFunction<
        typeof workspace.fs.stat
      >
      statMock.mockRejectedValue({})
      const result = await exists('/path/to/file')
      expect(result).toBe(false)
    })
  })
})
