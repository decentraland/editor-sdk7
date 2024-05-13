import * as vscode from 'vscode'

export async function exists(path: string) {
  return await vscode.workspace.fs.stat(vscode.Uri.file(path)).then(
    () => true,
    () => false
  )
}
