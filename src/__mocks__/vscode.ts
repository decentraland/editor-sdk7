export const window = {
  createOutputChannel: jest.fn().mockImplementation(() => ({
    append: jest.fn(),
    replace: jest.fn(),
    clear: jest.fn(),
    show: jest.fn(),
  })),
  withProgress: jest
    .fn()
    .mockImplementation(
      async (
        _options,
        onProgress: (progress: {
          report: (value: number) => void
        }) => Promise<any>
      ) => onProgress({ report: jest.fn() })
    ),
  showInformationMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  showQuickPick: jest.fn(),
}

export const ProgressLocation = {
  Notification: 15,
}

export const workspace = {
  workspaceFolders: [
    {
      uri: {
        fsPath: '/path/to/workspace',
      },
    },
  ],
  fs: {
    stat: jest.fn().mockResolvedValue({}),
    copy: jest.fn().mockResolvedValue({}),
  },
}

export const env = {
  asExternalUri: jest.fn().mockImplementation((value) => value),
  openExternal: jest.fn(),
}

export const Uri = {
  parse: jest.fn().mockImplementation((value) => value),
  file: jest.fn().mockImplementation((value) => value),
  joinPath: (...paths: string[]) => paths.join('/'),
}

export const ExtensionMode = {
  Production: 1,
  Development: 2,
  Test: 3,
}

export class TreeItem {}
