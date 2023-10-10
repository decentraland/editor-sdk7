import * as vscode from 'vscode'
import { npmInstall } from '../modules/npm'

export async function install() {
  const dependency = await vscode.window.showInputBox({
    title: 'Install package',
    placeHolder: '@dcl-sdk/utils',
    prompt: 'Enter the name of the package',
  })
  if (!dependency) {
    return
  }

  return npmInstall(dependency)
}
